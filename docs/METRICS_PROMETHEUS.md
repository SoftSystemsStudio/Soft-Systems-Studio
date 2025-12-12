# Metrics & Prometheus Configuration

## Overview

The `/metrics` endpoint exposes Prometheus-compatible metrics for observability. This endpoint is secured with admin API key authentication and rate limiting to prevent information leakage and scrape abuse.

## Security

### Authentication

The metrics endpoint requires an admin API key for access:

- **Environment Variable**: `ADMIN_API_KEY`
- **Minimum Length**: 32 characters
- **Format**: Any secure random string

Generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Authorization Methods

#### 1. Header-based (Recommended)
```bash
curl http://localhost:4000/metrics \
  -H "x-api-key: your-admin-api-key-here"
```

#### 2. Query Parameter
```bash
curl "http://localhost:4000/metrics?api_key=your-admin-api-key-here"
```

### Rate Limiting

- **Limit**: 10 requests per minute per API key
- **Window**: 1 minute (60 seconds)
- **Response**: `429 Too Many Requests` with `Retry-After` header

This limit is suitable for:
- Prometheus scrape intervals of 15s or longer
- Multiple Prometheus instances with different scrape intervals
- Ad-hoc metrics queries

## Prometheus Configuration

### Basic Configuration

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'agent-api'
    scrape_interval: 30s
    scrape_timeout: 10s
    metrics_path: '/metrics'
    scheme: https  # or http for local
    
    static_configs:
      - targets:
          - 'api.yourdomain.com:443'
    
    # Authentication via custom header
    params:
      # Option 1: Query parameter (less secure, visible in logs)
      # api_key: ['your-admin-api-key-here']
    
    # Option 2: Custom headers (recommended)
    authorization:
      type: Bearer
      credentials_file: /etc/prometheus/api_key.txt
    
    # OR use basic auth with headers
    headers:
      x-api-key: 'your-admin-api-key-here'
```

### Secure Credential Management

#### Option 1: File-based (Recommended)

Create a credentials file:
```bash
echo "your-admin-api-key-here" > /etc/prometheus/api_key.txt
chmod 600 /etc/prometheus/api_key.txt
chown prometheus:prometheus /etc/prometheus/api_key.txt
```

Reference in `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'agent-api'
    headers:
      x-api-key_file: /etc/prometheus/api_key.txt
```

#### Option 2: Environment Variable

Set in Prometheus environment:
```bash
export ADMIN_API_KEY="your-admin-api-key-here"
```

Use in `prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'agent-api'
    headers:
      x-api-key: ${ADMIN_API_KEY}
```

#### Option 3: Kubernetes Secret

Create secret:
```bash
kubectl create secret generic metrics-auth \
  --from-literal=api-key=your-admin-api-key-here
```

Reference in Prometheus configuration:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    scrape_configs:
      - job_name: 'agent-api'
        kubernetes_sd_configs:
          - role: service
        relabel_configs:
          - source_labels: [__meta_kubernetes_service_name]
            action: keep
            regex: agent-api
        headers:
          x-api-key:
            secret:
              name: metrics-auth
              key: api-key
```

### Multiple Prometheus Instances

If running multiple Prometheus instances:

```yaml
# Prometheus Instance 1 (primary)
scrape_configs:
  - job_name: 'agent-api-primary'
    scrape_interval: 15s
    headers:
      x-api-key: 'admin-key-1'

# Prometheus Instance 2 (backup)
scrape_configs:
  - job_name: 'agent-api-backup'
    scrape_interval: 30s
    headers:
      x-api-key: 'admin-key-2'
```

Each instance should use the same `ADMIN_API_KEY` value.

## Available Metrics

### System Metrics (Default)
- `process_cpu_user_seconds_total` - CPU time in user mode
- `process_cpu_system_seconds_total` - CPU time in system mode
- `process_resident_memory_bytes` - Resident memory size
- `process_heap_bytes` - Heap size
- `nodejs_version_info` - Node.js version
- `nodejs_eventloop_lag_seconds` - Event loop lag

### Application Metrics

#### Queue Metrics
```
job_queue_waiting{queue="ingest"}
job_queue_active{queue="ingest"}
job_queue_failed{queue="ingest"}
```

#### Rate Limiting
```
rate_limit_hits_total{endpoint="/chat",limit_type="per_workspace"}
rate_limit_hits_total{endpoint="/run",limit_type="per_workspace"}
```

#### Redis
```
redis_connection_status  # 1 = connected, 0 = disconnected
```

#### Email
```
emails_sent_total{template="welcome",status="success"}
emails_sent_total{template="welcome",status="error"}
```

## Troubleshooting

### 401 Unauthorized
**Problem**: Missing or invalid API key

**Solution**:
```bash
# Check if ADMIN_API_KEY is set
echo $ADMIN_API_KEY

# Verify in your .env file
grep ADMIN_API_KEY .env

# Test manually
curl -v http://localhost:4000/metrics \
  -H "x-api-key: your-admin-api-key-here"
```

### 503 Service Unavailable
**Problem**: `ADMIN_API_KEY` not configured in application

**Solution**:
```bash
# Set in .env
echo 'ADMIN_API_KEY=your-admin-api-key-here' >> .env

# Restart application
pnpm --filter agent-api dev
```

### 429 Too Many Requests
**Problem**: Exceeding rate limit (10 requests/minute)

**Solution**:
1. Increase scrape interval to 15s or higher
2. Reduce number of Prometheus instances scraping same endpoint
3. Check for misconfigured scrapers making excessive requests

**Check rate limit headers**:
```bash
curl -I http://localhost:4000/metrics \
  -H "x-api-key: your-admin-api-key-here"

# Look for:
# Retry-After: 30
```

### Empty Metrics
**Problem**: Authentication succeeds but no metrics returned

**Solution**:
1. Check if metrics are being registered:
   ```typescript
   import client from './metrics';
   console.log(await client.register.metrics());
   ```

2. Verify metric collection is enabled:
   ```typescript
   import { queueWaitingGauge } from './metrics';
   queueWaitingGauge.set({ queue: 'test' }, 10);
   ```

## Security Best Practices

### 1. Key Rotation
Rotate admin API keys regularly (e.g., every 90 days):

```bash
# Generate new key
NEW_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# Update application
echo "ADMIN_API_KEY=$NEW_KEY" >> .env

# Update Prometheus
echo "$NEW_KEY" > /etc/prometheus/api_key.txt

# Restart both services
```

### 2. Network Security
- Use HTTPS in production
- Restrict metrics endpoint to internal network
- Use firewall rules to limit access:
  ```bash
  # Allow only Prometheus server
  iptables -A INPUT -p tcp --dport 4000 -s prometheus-server-ip -j ACCEPT
  iptables -A INPUT -p tcp --dport 4000 -j DROP
  ```

### 3. Audit Logging
All metrics access is logged:
```json
{
  "level": "info",
  "msg": "Metrics access granted",
  "ip": "10.0.1.5",
  "path": "/metrics"
}
```

Monitor for suspicious activity:
```bash
# Count failed authentication attempts
grep "Invalid admin API key attempt" logs/app.log | wc -l

# Track access patterns
grep "Metrics access granted" logs/app.log | jq '.ip' | sort | uniq -c
```

### 4. Minimize Exposure
- Don't expose metrics endpoint publicly
- Use internal load balancer for Prometheus access
- Consider separate metrics service for isolation

## Grafana Dashboards

### Import Datasource
```json
{
  "name": "Agent API Metrics",
  "type": "prometheus",
  "url": "http://prometheus:9090",
  "access": "proxy"
}
```

### Sample Queries

#### Request Rate
```promql
rate(rate_limit_hits_total[5m])
```

#### Queue Depth
```promql
job_queue_waiting{queue="ingest"}
```

#### Error Rate
```promql
rate(emails_sent_total{status="error"}[5m])
```

#### Redis Status
```promql
redis_connection_status
```

## Production Deployment

### Environment Variables
```bash
# Required
ADMIN_API_KEY=<32+ char secure key>

# Optional (defaults shown)
NODE_ENV=production
LOG_LEVEL=info
```

### Health Check
Verify metrics endpoint is secured:
```bash
# Should return 401
curl http://api.yourdomain.com/metrics

# Should return 200
curl http://api.yourdomain.com/metrics \
  -H "x-api-key: $ADMIN_API_KEY"
```

### Monitoring
Set up alerts for:
1. Failed authentication attempts
2. Rate limit violations
3. Metrics endpoint downtime

Example Prometheus alert:
```yaml
groups:
  - name: metrics_security
    rules:
      - alert: MetricsAuthFailures
        expr: increase(rate_limit_hits_total{endpoint="/metrics"}[5m]) > 10
        annotations:
          summary: "High rate of metrics authentication failures"
```

## References

- [Prometheus Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)
- [Security Best Practices](https://prometheus.io/docs/operating/security/)
- [Node.js prom-client](https://github.com/siimon/prom-client)
