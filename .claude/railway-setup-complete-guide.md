# Railway Setup Guide - Complete Beginner's Walkthrough

> **Your Complete Guide to Deploying the Agent API to Railway**
>
> Created: 2026-01-09
> Last Updated: 2026-01-09
> Difficulty: Beginner-Friendly

---

## Table of Contents

1. [What is Railway?](#1-what-is-railway)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Sign Up for Railway](#step-1-sign-up-for-railway)
4. [Step 2: Create New Project from GitHub](#step-2-create-new-project-from-github)
5. [Step 3: Add Environment Variables (CRITICAL)](#step-3-add-environment-variables-critical)
6. [Step 4: Trigger Deployment](#step-4-trigger-deployment)
7. [Step 5: Monitor Health Checks](#step-5-monitor-health-checks)
8. [Step 6: Get Your Public URL](#step-6-get-your-public-url)
9. [Step 7: Test Deployment](#step-7-test-deployment)
10. [Step 8: Connect to Vercel Frontend](#step-8-connect-to-vercel-frontend)
11. [Step 9: Configure Custom Domain (Optional)](#step-9-configure-custom-domain-optional)
12. [Step 10: Set Up Monitoring](#step-10-set-up-monitoring)
13. [Cost Estimation](#cost-estimation)
14. [Troubleshooting Guide](#troubleshooting-guide)
15. [Next Steps](#next-steps)

**Appendix:**

- [A. Complete Environment Variable Reference](#appendix-a-complete-environment-variable-reference)
- [B. Health Check Endpoint Details](#appendix-b-health-check-endpoint-details)
- [C. Database Migration Guide](#appendix-c-database-migration-guide)
- [D. Scaling Options](#appendix-d-scaling-options)
- [E. Railway CLI Usage (Advanced)](#appendix-e-railway-cli-usage-advanced)

---

## 1. What is Railway?

### Overview

**Railway** is a Platform-as-a-Service (PaaS) that makes deploying web applications incredibly simple. Think of it as:

- **Like Heroku** - But with better pricing and modern tooling
- **Like Render** - But faster deployment times
- **Like AWS/GCP** - But without the complexity

### How Railway Works

1. **You connect your GitHub repository** → Railway watches for changes
2. **You push code to GitHub** → Railway automatically builds and deploys
3. **Railway runs your app 24/7** → No manual server management needed

### What Railway Does for You

✅ **Infrastructure**: Servers, networking, load balancing
✅ **Build Process**: Automatic Docker builds from your Dockerfile
✅ **Monitoring**: Health checks, metrics, logs
✅ **Scaling**: Easy vertical (more resources) and horizontal (more instances) scaling
✅ **SSL/HTTPS**: Free automatic SSL certificates
✅ **Zero-Downtime Deploys**: Rolling updates without service interruption

### What You Still Need to Provide

⚠️ **Environment Variables**: Database URLs, API keys, secrets
⚠️ **External Services**: Database (Neon), Redis (Upstash), Vector DB (Qdrant)
⚠️ **Application Code**: Your Dockerfile and source code (already done ✅)

---

## 2. Prerequisites

Before starting, make sure you have:

### ✅ Accounts & Access

- [ ] **GitHub account** with access to `SoftSystemsStudio/Soft-Systems-Studio` repo
- [ ] **Railway account** (we'll create this in Step 1)
- [ ] **Neon PostgreSQL** database provisioned
- [ ] **Upstash Redis** instance provisioned
- [ ] **Qdrant Cloud** cluster provisioned
- [ ] **OpenAI API key**

### ✅ Information You'll Need

Have these ready before starting:

1. **Neon PostgreSQL Connection String**
   - Format: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`
   - Find in: Neon Dashboard → Your Project → Connection Details

2. **Upstash Redis URL**
   - Format: `rediss://default:password@host.upstash.io:6379`
   - Find in: Upstash Console → Your Redis → REST API

3. **Qdrant Cloud URL & API Key**
   - URL Format: `https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east.aws.cloud.qdrant.io:6333`
   - API Key Format: Long string starting with letters/numbers
   - Find in: Qdrant Cloud Dashboard → Your Cluster → API Keys

4. **OpenAI API Key**
   - Format: `sk-proj-...` (starts with `sk-`)
   - Find in: OpenAI Platform → API Keys

5. **JWT Secret** (you'll generate this)
   - 64-character random string
   - We'll show you how to generate it

### ✅ Your Repository Status

- [ ] Code is pushed to `main` branch
- [ ] Dockerfile exists at repository root
- [ ] `railway.json` exists at repository root
- [ ] Health check endpoint (`/health`) is implemented
- [ ] No secrets committed to git (`.env` files in `.gitignore`)

---

## Step 1: Sign Up for Railway

### 1.1 Go to Railway Website

🔗 Open: **https://railway.app**

### 1.2 Sign Up with GitHub

1. Click **"Login"** or **"Start a New Project"** in the top right
2. Select **"Login with GitHub"**
3. GitHub will ask for permissions:
   - **Read access to your repositories** ✅ Required
   - **Read your email** ✅ Required
   - **Write access** (for deployments) ✅ Required
4. Click **"Authorize Railway"**

### 1.3 Choose a Pricing Plan

Railway will show you pricing options:

#### **Hobby Plan** - $5/month

- **Includes**: $5 in compute credits
- **Compute**: 500 GB-hours/month
- **Best for**: Development, side projects, low-traffic apps
- **Your app usage**: ~100 GB-hours/month (fits easily)

#### **Pro Plan** - $20/month

- **Includes**: $20 in compute credits
- **Compute**: 2000 GB-hours/month
- **Priority support**: Faster response times
- **Best for**: Production apps, higher traffic

#### **Recommendation**

✅ **Start with Hobby Plan** ($5/month)

- Your app's usage is well within limits
- You can upgrade anytime if needed
- First month is essentially free (you get $5 credit)

### 1.4 Add Payment Method

1. Railway will ask for a credit card (even for Hobby plan)
2. Enter your card details
3. **Note**: You won't be charged more than the plan amount unless you exceed included credits

### 1.5 Verify Email

1. Check your email for Railway verification
2. Click the verification link
3. You're now ready to create projects!

---

## Step 2: Create New Project from GitHub

### 2.1 From Railway Dashboard

1. You'll see the Railway dashboard (empty at first)
2. Click **"New Project"** (big purple button)

### 2.2 Choose Deployment Method

Railway shows several options:

- **Deploy from GitHub repo** ← **Choose this one**
- **Deploy from Template**
- **Empty Project**

Click: **"Deploy from GitHub repo"**

### 2.3 Authorize GitHub Repository Access

If this is your first project:

1. Railway asks: **"Install Railway App on GitHub"**
2. Click **"Configure GitHub App"**
3. GitHub opens asking which repositories to grant access
4. **Option A**: Select "Only select repositories"
   - Choose: `SoftSystemsStudio/Soft-Systems-Studio`
5. **Option B**: Select "All repositories" (if you want Railway for other projects too)
6. Click **"Install & Authorize"**

### 2.4 Select Your Repository

1. Railway shows a list of your repositories
2. Find and click: **`SoftSystemsStudio/Soft-Systems-Studio`**
3. Railway automatically detects:
   - ✅ Dockerfile found at root
   - ✅ Branch: `main`

### 2.5 Configure Service

Railway will ask:

**Service Name**: (auto-generated like `agent-api` or `soft-systems-studio`)

- You can rename it now or later (e.g., `agent-api-production`)

**Root Directory**: Leave as `/` (entire repo)

**Branch**: `main` (default)

Click **"Deploy"**

### 2.6 First Build Starts (Will Fail - Expected!)

Railway immediately starts building:

1. **Build Phase**: Builds Docker image (~3-5 minutes)
   - Status: `Building...`
   - You'll see build logs scrolling
   - **Expected outcome**: ✅ Build succeeds (Docker image builds fine)

2. **Deploy Phase**: Starts the container
   - Status: `Deploying...`
   - Container starts running
   - **Expected outcome**: ✅ Deploy starts

3. **Health Check Phase**: Tests `/health` endpoint
   - Status: `Waiting for health check...`
   - Railway pings `http://your-app:5000/health`
   - **Expected outcome**: ❌ **HEALTH CHECK FAILS**

**Why it fails**: Environment variables aren't set yet, so your app can't connect to database/Redis/Qdrant.

**This is completely normal!** We'll fix it in Step 3.

---

## Step 3: Add Environment Variables (CRITICAL)

This is the **most important step**. Your app needs these variables to function.

### 3.1 Navigate to Variables Tab

1. In your Railway project, click on your **service** (the card/box showing your app)
2. At the top, you'll see tabs: **Deployments | Variables | Settings | Metrics**
3. Click **"Variables"**

### 3.2 Understanding Environment Variables

**Why are these needed?**

Your app code uses environment variables to:

- Connect to external services (database, Redis, Qdrant)
- Authenticate with APIs (OpenAI, Anthropic)
- Configure security (JWT secret)
- Set application behavior (production mode, logging)

**Important**: These are **secrets** - never commit them to git!

### 3.3 Add Variables One by One

Click **"+ New Variable"** for each variable below.

#### **Required Variables**

##### 1. DATABASE_URL

```
Name: DATABASE_URL
Value: postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

**How to get this value:**

1. Go to Neon Dashboard: https://console.neon.tech
2. Select your project
3. Click **"Connection Details"**
4. Copy the connection string (make sure it includes `?sslmode=require`)

**Example:**

```
postgresql://softsystems_owner:abc123xyz@ep-cool-morning-123456.us-east-2.aws.neon.tech/softsystems?sslmode=require
```

##### 2. REDIS_URL

```
Name: REDIS_URL
Value: rediss://default:password@loving-starfish-12345.upstash.io:6379
```

**How to get this value:**

1. Go to Upstash Console: https://console.upstash.com
2. Select your Redis database
3. Scroll to **"REST API"** section
4. Copy the **"UPSTASH_REDIS_REST_URL"** (starts with `rediss://`)

**Note**: Must start with `rediss://` (double 's' for SSL)

**Example:**

```
rediss://default:AbCdEfGhIjKlMnOpQrStUvWxYz@loving-starfish-12345.upstash.io:6379
```

##### 3. QDRANT_URL

```
Name: QDRANT_URL
Value: https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east.aws.cloud.qdrant.io:6333
```

**How to get this value:**

1. Go to Qdrant Cloud Dashboard: https://cloud.qdrant.io
2. Select your cluster
3. Copy the **"Cluster URL"** from the overview
4. Make sure it ends with `:6333` (port number)

**Example:**

```
https://a1b2c3d4-5678-9abc-def0-123456789abc.us-east.aws.cloud.qdrant.io:6333
```

##### 4. QDRANT_API_KEY

```
Name: QDRANT_API_KEY
Value: [Your Qdrant API key - long string]
```

**How to get this value:**

1. In Qdrant Cloud Dashboard → Your cluster
2. Click **"API Keys"** tab
3. Copy an existing key OR create a new one

**Example:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### 5. OPENAI_API_KEY

```
Name: OPENAI_API_KEY
Value: sk-proj-...
```

**How to get this value:**

1. Go to OpenAI Platform: https://platform.openai.com/api-keys
2. Create a new API key OR copy existing one
3. **Must start with `sk-`** (Railway will validate this)

**Example:**

```
sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

##### 6. JWT_SECRET

```
Name: JWT_SECRET
Value: [64-character random string you'll generate]
```

**How to generate this value:**

Option A - In your terminal:

```bash
openssl rand -hex 32
```

Option B - In Node.js (if openssl not available):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Option C - Online generator (use with caution):

- https://generate-secret.vercel.app/32

**Must be**: At least 32 characters for security

**Example:**

```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

##### 7. NODE_ENV

```
Name: NODE_ENV
Value: production
```

**Exactly as shown** - tells your app to run in production mode.

##### 8. PORT

```
Name: PORT
Value: 5000
```

**Exactly as shown** - Railway will map external requests to this internal port.

##### 9. LOG_LEVEL

```
Name: LOG_LEVEL
Value: info
```

**Options**: `fatal`, `error`, `warn`, `info`, `debug`, `trace`
**Recommended**: `info` (balances detail and noise)

#### **Optional but Recommended Variables**

##### 10. SENTRY_DSN (Error Tracking)

```
Name: SENTRY_DSN
Value: https://...@sentry.io/...
```

**Only add if you have Sentry configured**

Find in: Sentry Project → Settings → Client Keys (DSN)

##### 11. ANTHROPIC_API_KEY (Claude AI)

```
Name: ANTHROPIC_API_KEY
Value: sk-ant-api03-...
```

**Only add if you use Claude AI** for chat features

Find in: Anthropic Console → API Keys

##### 12. STRIPE_SECRET_KEY (Payments)

```
Name: STRIPE_SECRET_KEY
Value: sk_live_... or sk_test_...
```

**Only add if you have Stripe payments**

Find in: Stripe Dashboard → Developers → API Keys

### 3.4 Verify All Variables Added

Check that you have **at minimum**:

- ✅ DATABASE_URL
- ✅ REDIS_URL
- ✅ QDRANT_URL
- ✅ QDRANT_API_KEY
- ✅ OPENAI_API_KEY
- ✅ JWT_SECRET
- ✅ NODE_ENV
- ✅ PORT
- ✅ LOG_LEVEL

**Total**: 9 required variables

Railway **auto-saves** as you add each variable (no "Save" button needed).

### 3.5 Common Mistakes to Avoid

❌ **Wrong format for DATABASE_URL**

- Must include `?sslmode=require` at the end
- Must start with `postgresql://`

❌ **Wrong format for REDIS_URL**

- Must start with `rediss://` (double 's')
- Not `redis://` (single 's')

❌ **Forgot `:6333` port on QDRANT_URL**

- Must end with `:6333`

❌ **JWT_SECRET too short**

- Must be at least 32 characters
- Recommended: 64 characters

❌ **OPENAI_API_KEY doesn't start with `sk-`**

- Double-check you copied the full key

---

## Step 4: Trigger Deployment

### 4.1 Redeploy with Environment Variables

Now that environment variables are added, trigger a new deployment:

**Option A**: Automatic Redeploy

- Railway automatically detects env var changes
- Should start redeploying within ~30 seconds

**Option B**: Manual Redeploy

1. Go to **"Deployments"** tab
2. Find the latest (failed) deployment
3. Click the **3-dot menu** (⋮) on the right
4. Click **"Redeploy"**

### 4.2 Watch the Build Process

Railway starts a new deployment:

#### Phase 1: Building (3-5 minutes)

```
Status: Building...
```

Railway runs your Dockerfile:

1. Pulls base image (`node:22-slim`)
2. Installs dependencies (`pnpm install`)
3. Generates Prisma client
4. Builds TypeScript (`pnpm build`)
5. Creates production image

**Expected**: ✅ Build succeeds
**If it fails**: Check build logs for errors (usually dependency or TypeScript issues)

#### Phase 2: Deploying (~30 seconds)

```
Status: Deploying...
```

Railway:

1. Stops old container (if any)
2. Starts new container from built image
3. Waits for app to start listening on port 5000

**Expected**: ✅ Container starts

#### Phase 3: Health Check (up to 5 minutes)

```
Status: Waiting for health check...
```

Railway pings: `GET http://your-app:5000/health`

Your app checks:

- ✅ Database connection (Neon PostgreSQL)
- ✅ Redis connection (Upstash)
- ✅ Qdrant connection (Qdrant Cloud)

**If all services are healthy**: Returns `HTTP 200` with JSON response
**If any service fails**: Returns `HTTP 503` with error details

**Expected**: ✅ Health check passes

### 4.3 Success Indicators

When deployment succeeds, you'll see:

```
Status: Active
Latest Deployment: ✅ Healthy
```

In the deployment details:

- **Build**: Succeeded in X minutes
- **Deploy**: Succeeded
- **Health Check**: Passed

---

## Step 5: Monitor Health Checks

### 5.1 View Deployment Logs

Click the **"Logs"** tab to see real-time output.

#### What to Look For

**Successful startup looks like:**

```
[start] Starting agent-api server...
[start] ✅ Environment validation passed
[env] NODE_ENV: production
[env] PORT: 5000
[env] OPENAI_API_KEY: present
[db] ✅ Database connected
[redis] ✅ Redis connected
[qdrant] ✅ Qdrant connected (latency: 45ms)
[server] Server listening on port 5000
[health] Health check: all services healthy
```

**If you see errors**, check [Troubleshooting Guide](#troubleshooting-guide) below.

### 5.2 Test Health Check Manually

Once deployed, Railway generates a public URL (we'll get it in Step 6).

To test health check:

```bash
curl https://your-app-name.up.railway.app/health
```

**Expected response:**

```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "qdrant": "healthy"
  },
  "qdrant": {
    "healthy": true,
    "latencyMs": 45
  },
  "env": {
    "nodeEnv": "production",
    "openaiKeyPresent": true,
    "requireRedisHealth": true,
    "requireQdrantHealth": true
  }
}
```

### 5.3 Understanding Health Check Results

**Status Code: 200** ✅

- All services connected successfully
- App is fully operational
- Ready to handle requests

**Status Code: 503** ❌

- One or more services unreachable
- Check `services` object to see which failed
- See [Troubleshooting Guide](#troubleshooting-guide)

---

## Step 6: Get Your Public URL

### 6.1 Find Your Railway URL

Railway auto-generates a public URL for your service:

1. In your service view, look for the **"Domains"** section
2. You'll see a URL like:
   ```
   https://your-app-name.up.railway.app
   ```

**This is your production API URL!**

### 6.2 Test the URL

Open in browser or curl:

```bash
# Health check
curl https://your-app-name.up.railway.app/health

# Status endpoint
curl https://your-app-name.up.railway.app/api/v1/system/status
```

**Expected status response:**

```json
{
  "status": "operational",
  "version": "0.1.0",
  "uptime": 3600,
  "timestamp": "2026-01-09T15:30:00.000Z"
}
```

### 6.3 Copy Your URL

**Save this URL** - you'll need it to:

- Connect your Vercel frontend (Step 8)
- Test API endpoints
- Share with your team

---

## Step 7: Test Deployment

### 7.1 Test Public Endpoints

#### Health Check

```bash
curl https://your-app-name.up.railway.app/health
```

Should return `200 OK` with all services healthy.

#### Status Endpoint

```bash
curl https://your-app-name.up.railway.app/api/v1/system/status
```

Should return operational status.

### 7.2 Test Authentication (If Enabled)

If your app has auth endpoints:

#### Get Auth Token

```bash
curl -X POST https://your-app-name.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

Should return JWT token if credentials are valid.

### 7.3 Monitor First Hour

After deployment, monitor for:

- Memory usage (should be stable ~200-400 MB)
- CPU usage (should be low <20% when idle)
- Response times (should be <500ms for simple endpoints)
- Error rate (should be 0%)

Check **Metrics** tab in Railway dashboard.

---

## Step 8: Connect to Vercel Frontend

Now connect your Vercel-hosted frontend to the Railway backend.

### 8.1 Get Railway API URL

From Step 6, you have:

```
https://your-app-name.up.railway.app
```

### 8.2 Add to Vercel Environment Variables

1. Go to Vercel Dashboard: https://vercel.com
2. Select your frontend project (e.g., `soft-systems-studio-frontend`)
3. Click **"Settings"** → **"Environment Variables"**
4. Add new variable:

```
Name: NEXT_PUBLIC_API_URL
Value: https://your-app-name.up.railway.app
Production: ✅ (checked)
Preview: ✅ (checked)
Development: ❌ (unchecked - use localhost)
```

5. Click **"Save"**

### 8.3 Redeploy Vercel

Vercel auto-redeploys when you add environment variables:

1. Go to **"Deployments"** tab
2. Latest deployment should start automatically
3. Wait for deployment to complete (~2-3 minutes)

### 8.4 Test Full Stack

Visit your Vercel frontend URL:

```
https://your-app.vercel.app
```

Test features that call the backend API:

- Sign in / sign up
- Any forms that submit data
- Real-time features
- Data fetching

**All API calls should now go to Railway backend!**

---

## Step 9: Configure Custom Domain (Optional)

If you have a custom domain (e.g., `api.yourdomain.com`):

### 9.1 Add Custom Domain in Railway

1. In your Railway service, go to **"Settings"** → **"Domains"**
2. Click **"+ Custom Domain"**
3. Enter your domain: `api.yourdomain.com`
4. Railway shows DNS records to add:

```
Type: CNAME
Name: api
Value: your-app-name.up.railway.app
```

### 9.2 Add DNS Records

Go to your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

1. Find DNS settings for your domain
2. Add a new **CNAME record**:
   - **Name**: `api`
   - **Value**: `your-app-name.up.railway.app`
   - **TTL**: Auto or 3600

3. Save DNS changes

### 9.3 Wait for DNS Propagation

- **Time**: 5 minutes to 1 hour (usually ~10 minutes)
- **Check**: `dig api.yourdomain.com` to see if it resolves

### 9.4 Railway Auto-Provisions SSL

Once DNS propagates:

- Railway automatically requests Let's Encrypt SSL certificate
- Takes ~2-5 minutes
- Your API is now available at `https://api.yourdomain.com`

**Update Vercel** with new URL:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Step 10: Set Up Monitoring

### 10.1 Enable Railway Metrics

Railway provides built-in metrics:

1. Go to **"Metrics"** tab in your service
2. View:
   - **CPU Usage**: Should be <20% idle, <80% under load
   - **Memory Usage**: Should be ~200-400 MB steady state
   - **Network**: Requests per second, bandwidth

### 10.2 Configure Alerts (Optional)

1. Go to **"Settings"** → **"Notifications"**
2. Add webhook URL or email
3. Set alert triggers:
   - Deployment failed
   - Health check failed
   - Memory > 80%
   - CPU > 90%

### 10.3 Set Up Sentry (Recommended)

For error tracking:

1. Sign up for Sentry: https://sentry.io
2. Create new project (Node.js)
3. Copy DSN from Sentry dashboard
4. Add to Railway env vars:
   ```
   SENTRY_DSN=https://...@sentry.io/...
   ```
5. Redeploy

Sentry will now capture all errors and exceptions.

### 10.4 Monitor Logs Regularly

**First 24 hours**: Check logs every few hours
**First week**: Check logs daily
**Ongoing**: Set up alerts, check weekly

---

## Cost Estimation

### Railway Costs

#### Hobby Plan - $5/month

**Included**:

- $5 in compute credits
- 500 GB-hours/month

**Your app usage**:

- Always-on app (~720 hours/month)
- 512 MB memory (default)
- Shared CPU
- **Estimated**: ~100 GB-hours/month

**Result**: Well within Hobby plan limits ✅

#### Pro Plan - $20/month

**Included**:

- $20 in compute credits
- 2000 GB-hours/month
- Priority support

**When to upgrade**:

- Traffic increases significantly
- Need more memory/CPU
- Want dedicated resources
- Need faster support response

#### Overage Costs

If you exceed included credits:

- **$10 per additional GB-hour**

**How to avoid**:

- Monitor usage in Railway dashboard
- Set up billing alerts
- Optimize resource usage
- Scale horizontally only when needed

### External Services Costs

**Neon PostgreSQL**:

- Free tier: 10 GB storage, 100 hours compute
- Pro: Starting at $19/month

**Upstash Redis**:

- Free tier: 10,000 commands/day
- Pro: Starting at $10/month

**Qdrant Cloud**:

- Free tier: 1 GB vector storage
- Pro: Starting at $25/month

**OpenAI API**:

- Pay per use: ~$0.002/1K tokens
- Varies by model and usage

### Total Estimated Monthly Cost

**Minimal setup** (all free tiers): ~$5/month (Railway Hobby only)
**Production setup**: $50-100/month depending on tier choices

---

## Troubleshooting Guide

### Issue 1: Build Failed

**Symptom**: Red X on build step in Railway

**Common Causes**:

1. Missing dependency in `package.json`
2. TypeScript compilation errors
3. Prisma schema errors
4. Out of memory during build

**Diagnosis**:

1. Click on failed deployment
2. Read build logs
3. Look for error message near bottom

**Fixes**:

**Error: "Cannot find module '@softsystems/...'"**

```bash
# Locally verify workspace links
pnpm install
pnpm build
```

If it works locally, Railway should work too. Try **Redeploy**.

**Error: "Type error: ..."**

```bash
# Fix TypeScript errors locally
pnpm typecheck
# Fix errors, commit, push
```

**Error: "Prisma Client could not be generated"**

- Check `apps/agent-api/prisma/schema.prisma` is valid
- Ensure Dockerfile has `RUN npx prisma@6 generate`

---

### Issue 2: Deploy Failed - Health Check Timeout

**Symptom**: App builds successfully but fails health check after 300 seconds

**Common Causes**:

1. Database connection timeout
2. Missing environment variables
3. Wrong format for connection strings
4. App crashes on startup

**Diagnosis**:

1. Go to **"Logs"** tab
2. Look for errors after "Starting agent-api server..."

**Fixes**:

**Error: "Environment validation failed: DATABASE_URL Required"**

- Go to Variables tab
- Add missing DATABASE_URL

**Error: "Connection to database failed: timeout"**

- Check DATABASE_URL format
- Test connection locally:
  ```bash
  psql "postgresql://user:password@host/db?sslmode=require"
  ```
- Verify Neon database is active (not suspended)

**Error: "Redis connection failed"**

- Check REDIS_URL starts with `rediss://` (double 's')
- Test Redis connection:
  ```bash
  redis-cli -u "rediss://default:password@host:6379"
  ```
- Verify Upstash Redis is active

**Error: "Qdrant ping failed"**

- Check QDRANT_URL ends with `:6333`
- Verify QDRANT_API_KEY is correct
- Test Qdrant connection:
  ```bash
  curl -H "api-key: YOUR_KEY" https://your-cluster.qdrant.io:6333/collections
  ```

---

### Issue 3: 502 Bad Gateway

**Symptom**: Public URL returns 502 error

**Cause**: App crashed after initial health check

**Diagnosis**:

1. Check **"Logs"** for crash message
2. Look for uncaught exceptions

**Fixes**:

**Error: "JavaScript heap out of memory"**

- Increase memory in Railway
- Settings → Resources → Memory → 1GB

**Error: "Port 5000 is already in use"**

- Ensure your app uses `process.env.PORT`
- Check Dockerfile CMD uses correct port

**Error: Unhandled exception**

- Fix the bug locally
- Add try-catch blocks
- Commit, push, redeploy

---

### Issue 4: Database Connection "Too Many Connections"

**Symptom**: Errors like "remaining connection slots are reserved" or "too many clients"

**Cause**: Neon free tier has connection limits

**Fixes**:

**Solution 1**: Use Neon's connection pooler

```
# Instead of direct connection:
postgresql://user:pass@ep-xxx.aws.neon.tech/db

# Use pooler:
postgresql://user:pass@ep-xxx-pooler.aws.neon.tech/db?sslmode=require&pgbouncer=true
```

**Solution 2**: Reduce Prisma connection pool
In `apps/agent-api/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 5  // Add this
}
```

**Solution 3**: Upgrade Neon plan

- Pro plan: More connections allowed
- ~$19/month

---

### Issue 5: Slow Response Times

**Symptom**: API requests take >5 seconds

**Common Causes**:

1. Cold start (first request after idle)
2. Expensive database queries (N+1 problem)
3. Large API responses
4. External API timeouts

**Diagnosis**:

1. Check Railway Metrics → Response time graph
2. Add logging to slow endpoints
3. Use Sentry performance monitoring

**Fixes**:

**Cold start (if sleepApplication: true)**

- Set `sleepApplication: false` in railway.json
- Keeps app always warm

**N+1 queries**

```typescript
// Bad: N+1 query
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// Good: Single query with include
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

**Large responses**

- Add pagination
- Use cursor-based pagination for better performance
- Limit response fields

**External API timeouts**

- Add timeouts to fetch calls
- Implement retry logic with exponential backoff
- Cache frequently-accessed data in Redis

---

### Issue 6: Environment Variable Not Working

**Symptom**: Added variable but app doesn't see it

**Fixes**:

1. **Redeploy Required**
   - Railway doesn't hot-reload env vars
   - Go to Deployments → Redeploy

2. **Check Variable Name**
   - Must match exactly (case-sensitive)
   - No spaces in name
   - Example: `DATABASE_URL` not `database_url`

3. **Check Value Format**
   - No quotes needed (Railway handles this)
   - No newlines or extra spaces
   - Copy-paste carefully

4. **Verify in Logs**
   ```bash
   # Your app logs env vars (secrets redacted)
   [env] NODE_ENV: production
   [env] OPENAI_API_KEY: present
   ```

---

## Next Steps

### ✅ Completed

You've successfully:

- ✅ Created Railway account
- ✅ Deployed app from GitHub
- ✅ Configured environment variables
- ✅ Connected external services
- ✅ Set up monitoring

### 🎯 Recommended Next Steps

1. **Test All Features**
   - Test every API endpoint
   - Verify database operations work
   - Check authentication flows
   - Test file uploads (if any)

2. **Set Up Backups**
   - Configure Neon automated backups
   - Export Qdrant collections regularly
   - Document backup restoration process

3. **Performance Optimization**
   - Add Redis caching for frequent queries
   - Optimize database indexes
   - Implement rate limiting
   - Add CDN for static assets

4. **Security Hardening**
   - Review CORS settings
   - Add request validation
   - Implement rate limiting per user
   - Set up WAF (Web Application Firewall)

5. **Monitoring & Alerts**
   - Connect Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Configure Railway webhooks for deployment notifications
   - Create dashboard for key metrics

6. **Documentation**
   - Document API endpoints (OpenAPI/Swagger)
   - Create runbook for common issues
   - Document environment variables
   - Write deployment checklist

7. **Team Access**
   - Invite team members to Railway project
   - Set up role-based access control
   - Share access to external services (Neon, Upstash, Qdrant)

---

## Appendix A: Complete Environment Variable Reference

### Required Variables

| Variable         | Type   | Format                                           | Example                                                       |
| ---------------- | ------ | ------------------------------------------------ | ------------------------------------------------------------- |
| `DATABASE_URL`   | URL    | `postgresql://user:pass@host/db?sslmode=require` | `postgresql://user:abc@ep-xxx.neon.tech/mydb?sslmode=require` |
| `REDIS_URL`      | URL    | `rediss://user:pass@host:port`                   | `rediss://default:xyz@host.upstash.io:6379`                   |
| `QDRANT_URL`     | URL    | `https://cluster-id.cloud.qdrant.io:6333`        | `https://abc-123.us-east.aws.cloud.qdrant.io:6333`            |
| `QDRANT_API_KEY` | String | API key from Qdrant                              | `eyJhbGciOiJIUzI1NiIsInR5cCI...`                              |
| `OPENAI_API_KEY` | String | Starts with `sk-`                                | `sk-proj-abc123...`                                           |
| `JWT_SECRET`     | String | 32+ character random string                      | `a1b2c3d4e5f6...` (64 chars)                                  |
| `NODE_ENV`       | Enum   | `production`                                     | `production`                                                  |
| `PORT`           | Number | `5000`                                           | `5000`                                                        |
| `LOG_LEVEL`      | Enum   | `info`                                           | `info`                                                        |

### Optional Variables

| Variable            | Type   | Description             | Example                        |
| ------------------- | ------ | ----------------------- | ------------------------------ |
| `SENTRY_DSN`        | URL    | Sentry error tracking   | `https://...@sentry.io/123`    |
| `ANTHROPIC_API_KEY` | String | Claude AI API key       | `sk-ant-api03-...`             |
| `STRIPE_SECRET_KEY` | String | Stripe payments         | `sk_live_...` or `sk_test_...` |
| `RESEND_API_KEY`    | String | Email service           | `re_...`                       |
| `API_KEY`           | String | Service-to-service auth | 32+ character string           |
| `CRON_SECRET`       | String | Cron job authentication | 32+ character string           |

---

## Appendix B: Health Check Endpoint Details

### Endpoint

```
GET /health
```

### Implementation

Location: `apps/agent-api/src/api/v1/system/health.ts`

### What It Tests

1. **Database (PostgreSQL via Prisma)**

   ```sql
   SELECT 1;
   ```

   Verifies database connection is alive.

2. **Redis (Upstash)**

   ```typescript
   await isRedisHealthy(); // Ping command
   ```

   Verifies Redis connection and command execution.

3. **Qdrant (Vector Database)**
   ```typescript
   await pingQdrant(timeout: 500ms);
   ```
   Verifies Qdrant cluster is reachable.

### Response Format

**Success (HTTP 200)**:

```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "qdrant": "healthy"
  },
  "qdrant": {
    "healthy": true,
    "latencyMs": 45
  },
  "env": {
    "nodeEnv": "production",
    "openaiKeyPresent": true,
    "requireRedisHealth": true,
    "requireQdrantHealth": true
  }
}
```

**Failure (HTTP 503)**:

```json
{
  "status": "degraded",
  "services": {
    "database": "healthy",
    "redis": "unhealthy",
    "qdrant": "healthy"
  },
  "qdrant": {
    "healthy": true,
    "latencyMs": 45
  },
  "env": {
    "nodeEnv": "production",
    "openaiKeyPresent": true,
    "requireRedisHealth": true,
    "requireQdrantHealth": true
  }
}
```

### Configuration

Environment variables can make checks optional:

```bash
REQUIRE_REDIS_HEALTH=false   # Makes Redis check optional
REQUIRE_QDRANT_HEALTH=false  # Makes Qdrant check optional
```

Database is always required.

---

## Appendix C: Database Migration Guide

### When You Update Prisma Schema

**Scenario**: You modified `apps/agent-api/prisma/schema.prisma`

### Local Development

1. **Generate migration**:

   ```bash
   cd apps/agent-api
   pnpm prisma migrate dev --name add_new_field
   ```

2. **Test locally**:

   ```bash
   pnpm dev
   # Verify app works with new schema
   ```

3. **Commit migration files**:
   ```bash
   git add apps/agent-api/prisma/migrations/
   git commit -m "feat: add new field to User model"
   git push origin main
   ```

### Railway Deployment

Railway automatically:

1. Detects schema changes
2. Runs `npx prisma@6 generate` during build
3. Applies migrations via Prisma Client

**No manual intervention needed!**

### If Migration Fails

**Scenario**: Migration fails in Railway but succeeded locally

**Diagnosis**:

```bash
# Check Railway logs for Prisma errors
```

**Manual Migration**:

1. Railway → Service → Settings
2. Add one-time command:
   ```bash
   npx prisma migrate deploy
   ```
3. Click "Run Command"

### Rolling Back Migrations

**Warning**: Be careful with rollbacks in production!

1. **Locally**, generate rollback migration:

   ```bash
   pnpm prisma migrate dev --name rollback_field
   # Manually edit migration to undo changes
   ```

2. **Commit and push**:
   ```bash
   git add apps/agent-api/prisma/migrations/
   git commit -m "fix: rollback field addition"
   git push origin main
   ```

### Database Backups Before Migrations

**Recommended**: Always backup before schema changes

**Neon Backups**:

1. Neon Dashboard → Your Project
2. **"Backups"** section
3. Click **"Create Backup"**

**Or use pg_dump**:

```bash
pg_dump "postgresql://user:pass@host/db?sslmode=require" > backup.sql
```

---

## Appendix D: Scaling Options

### Vertical Scaling (More Resources)

**When to use**: Single instance needs more power

**How to scale**:

1. Railway → Service → Settings → Resources
2. Increase:
   - **Memory**: 512 MB → 1 GB → 2 GB → 4 GB
   - **CPU**: Shared → 1 vCPU → 2 vCPU

**Cost**: Higher resource tiers cost more per hour

**Example**:

- 512 MB + shared CPU: ~$0.000008/second
- 2 GB + 1 vCPU: ~$0.000020/second

### Horizontal Scaling (More Instances)

**When to use**: High traffic, need redundancy

**How to scale**:

Edit `railway.json`:

```json
{
  "deploy": {
    "numReplicas": 3
  }
}
```

Commit and push → Railway deploys 3 instances behind load balancer

**Cost**: 3x the compute hours

**Considerations**:

- Stateless app required (no local sessions)
- Use Redis for shared state
- Database connection pooling critical

### Auto-Scaling (Not Available)

Railway doesn't support auto-scaling yet (as of 2026).

**Alternative**: Set numReplicas high enough for peak traffic.

### Database Scaling

**Neon PostgreSQL**:

- Free: 10 GB storage, shared CPU
- Launch: $19/month, 10 GB, 0.25 vCPU
- Scale: $69/month, 50 GB, 2 vCPU

**When to upgrade**:

- Storage > 10 GB
- Query performance slow
- Connection limit hit

**Upstash Redis**:

- Free: 10,000 commands/day
- Pro: $10/month, 100,000 commands/day
- Enterprise: Custom pricing

**Qdrant Cloud**:

- Free: 1 GB vector storage
- Pro: $25/month, 10 GB storage
- Enterprise: Custom pricing

---

## Appendix E: Railway CLI Usage (Advanced)

### Installation

```bash
npm install -g @railway/cli
# or
brew install railway
```

### Login

```bash
railway login
```

Opens browser for authentication.

### Link Project

```bash
railway link
# Select your project from list
```

### Deploy from CLI

```bash
railway up
```

Deploys current directory (must be git repository).

### View Logs

```bash
railway logs
```

Streams real-time logs.

### Run Commands

```bash
railway run npm start
# Runs with Railway environment variables
```

### Manage Environment Variables

```bash
# List all variables
railway variables

# Set variable
railway variables set KEY=value

# Delete variable
railway variables delete KEY
```

### Open Dashboard

```bash
railway open
```

Opens project in browser.

### Common CLI Workflows

**Deploy specific branch**:

```bash
railway up --branch staging
```

**Run migrations**:

```bash
railway run npx prisma migrate deploy
```

**Shell into deployment**:

```bash
railway shell
```

**Download logs**:

```bash
railway logs > deployment.log
```

---

## Summary Checklist

### ✅ Setup Complete

- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] Project created in Railway
- [ ] All required environment variables added (9 minimum)
- [ ] Deployment successful
- [ ] Health checks passing
- [ ] Public URL accessible
- [ ] `/health` endpoint returns 200 OK
- [ ] `/api/v1/system/status` endpoint works
- [ ] Vercel frontend connected to Railway backend
- [ ] Tested full-stack functionality
- [ ] Monitoring set up
- [ ] Documentation reviewed

### 🎉 Congratulations!

Your app is now live and running 24/7 on Railway!

**Your Production URLs**:

- Backend API: `https://your-app-name.up.railway.app`
- Frontend: `https://your-app.vercel.app`

### 📞 Need Help?

- **Railway Discord**: https://discord.gg/railway
- **Railway Docs**: https://docs.railway.app
- **GitHub Issues**: https://github.com/SoftSystemsStudio/Soft-Systems-Studio/issues

---

**Last Updated**: 2026-01-09
**Author**: Claude Sonnet 4.5
**Version**: 1.0.0
