# n8n-workflow

Use when creating, debugging, or managing n8n automation workflows. Covers workflow design patterns, node configuration, error handling, webhooks, and integration with the n8n MCP server.

## When to Use

- Creating new n8n workflows
- Debugging workflow execution issues
- Configuring webhook triggers
- Setting up error handling and retry logic
- Integrating n8n with external services
- Optimizing workflow performance

## n8n Core Concepts

### Workflow Structure

```
Trigger Node → Processing Nodes → Output Node
     ↓              ↓                 ↓
  (Start)     (Transform/Act)    (Destination)
```

### Node Types

| Type           | Purpose                  | Examples                  |
| -------------- | ------------------------ | ------------------------- |
| **Trigger**    | Start workflow execution | Webhook, Schedule, Manual |
| **Regular**    | Process/transform data   | HTTP Request, Code, Set   |
| **Credential** | Authenticate services    | API keys, OAuth           |

## Common Patterns

### 1. Webhook-Triggered Workflow

```json
{
  "name": "Webhook Handler",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "intake-handler",
        "httpMethod": "POST",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "return items.map(item => ({ json: { ...item.json, processed: true } }));"
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json"
      }
    }
  ]
}
```

### 2. Scheduled Data Sync

```json
{
  "name": "Daily Sync",
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "hoursInterval": 24 }]
        }
      }
    },
    {
      "name": "Fetch Source",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.source.com/data",
        "method": "GET"
      }
    },
    {
      "name": "Update Destination",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.destination.com/sync",
        "method": "POST"
      }
    }
  ]
}
```

### 3. Error Handling Pattern

```json
{
  "name": "Error Handler",
  "nodes": [
    {
      "name": "Try Operation",
      "type": "n8n-nodes-base.httpRequest",
      "continueOnFail": true
    },
    {
      "name": "Check Error",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [{ "value1": "={{ $json.error }}", "value2": true }]
        }
      }
    },
    {
      "name": "Send Alert",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#alerts",
        "text": "Workflow failed: {{ $json.error }}"
      }
    }
  ]
}
```

## Best Practices

### 1. Workflow Design

- **Single responsibility**: One workflow per business process
- **Modular structure**: Use sub-workflows for reusable logic
- **Explicit naming**: Name nodes by their function, not type
- **Documentation**: Add sticky notes for complex logic

### 2. Error Handling

```javascript
// In Code node - proper error handling
try {
  const result = await someOperation();
  return [{ json: { success: true, data: result } }];
} catch (error) {
  return [{ json: { success: false, error: error.message } }];
}
```

### 3. Data Transformation

```javascript
// Transform array data efficiently
const items = $input.all();
return items.map((item) => ({
  json: {
    id: item.json.id,
    name: item.json.name?.trim(),
    timestamp: new Date().toISOString(),
  },
}));
```

### 4. Webhook Security

- Always validate incoming webhook signatures
- Use authentication on production webhooks
- Implement rate limiting via n8n settings
- Log webhook payloads for debugging

```javascript
// Validate webhook signature
const crypto = require('crypto');
const signature = $request.headers['x-signature'];
const payload = JSON.stringify($json);
const expected = crypto.createHmac('sha256', 'secret').update(payload).digest('hex');

if (signature !== expected) {
  throw new Error('Invalid signature');
}
```

## n8n MCP Server Integration

The n8n MCP server (already configured) provides these tools:

| Tool                  | Description              |
| --------------------- | ------------------------ |
| `list_workflows`      | List all workflows       |
| `get_workflow`        | Get workflow by ID       |
| `create_workflow`     | Create new workflow      |
| `update_workflow`     | Update existing workflow |
| `delete_workflow`     | Delete workflow          |
| `activate_workflow`   | Activate workflow        |
| `deactivate_workflow` | Deactivate workflow      |
| `execute_workflow`    | Run workflow via API     |
| `get_execution`       | Get execution details    |
| `list_executions`     | List execution history   |
| `run_webhook`         | Trigger webhook workflow |

### Example: Create Workflow via MCP

```
"Create an n8n workflow that:
1. Triggers on webhook POST to /new-lead
2. Validates the email field
3. Adds the lead to our CRM
4. Sends a Slack notification"
```

## Project-Specific Patterns

### Integration with agent-api

```javascript
// Webhook from agent-api to n8n
const webhookUrl = process.env.N8N_INTAKE_WEBHOOK_URL;
await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
  },
  body: JSON.stringify({ event: 'intake_completed', data }),
});
```

### Webhook URL Patterns

| Webhook    | Purpose             | URL Pattern                   |
| ---------- | ------------------- | ----------------------------- |
| Intake     | New client intake   | `/webhook/intake-processor`   |
| Proposal   | Proposal generation | `/webhook/proposal-generator` |
| Onboarding | Client onboarding   | `/webhook/onboarding-flow`    |

## Debugging Workflows

### 1. Check Execution History

```
"List the last 5 executions of workflow 123"
"Show me failed executions from today"
```

### 2. Common Issues

| Issue                  | Cause               | Solution                      |
| ---------------------- | ------------------- | ----------------------------- |
| Webhook not triggering | Inactive workflow   | Activate via MCP or UI        |
| Data not passing       | Missing expression  | Use `{{ $json.field }}`       |
| Auth failing           | Expired credentials | Update credentials in n8n     |
| Timeout                | Long operation      | Increase timeout or use queue |

### 3. Testing Webhooks

```bash
# Test webhook locally
curl -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Environment Variables

Required for n8n MCP server:

```bash
N8N_API_URL="https://your-n8n.com/api/v1"
N8N_API_KEY="your_api_key"
N8N_WEBHOOK_USERNAME="webhook_user"      # Optional
N8N_WEBHOOK_PASSWORD="webhook_password"  # Optional
```

## References

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Node Reference](https://docs.n8n.io/integrations/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [n8n MCP Server](https://github.com/leonardsellem/n8n-mcp-server)
