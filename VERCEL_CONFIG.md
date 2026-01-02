# Vercel Frontend Configuration Guide

**⚠️ IMPORTANT: This file contains configuration steps. Safe to commit without sensitive data.**

This guide walks you through configuring Vercel environment variables for the frontend.

---

## Prerequisites

- ✅ Railway API is deployed and healthy
- ✅ You have your Railway deployment URL (e.g., `https://agent-api-production-xxxx.up.railway.app`)

---

## Step 1: Access Vercel Dashboard

1. Go to <https://vercel.com/dashboard>
2. Navigate to your `soft-systems-studio` or `frontend` project
3. Click on **Settings**
4. Click on **Environment Variables**

---

## Step 2: Add Environment Variables

### Required Variables

#### 1. API Connection

**Variable:** `NEXT_PUBLIC_API_URL`

**Value:** Your Railway API URL (without trailing slash)

**Example:**

```
https://agent-api-production-xxxx.up.railway.app
```

**How to find your Railway URL:**

1. Go to Railway dashboard
2. Click on agent-api service
3. Click on "Settings" tab
4. Look for "Public Networking" section
5. Copy the generated domain (or custom domain if you set one)

---

### Optional Variables (can add later)

#### 2. Google Analytics (if you use it)

**Variable:** `NEXT_PUBLIC_GA_ID`

**Value:** Your Google Analytics tracking ID

**Example:**

```
G-XXXXXXXXXX
```

---

#### 3. Stripe (if using billing/payments)

**Variable:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Value:** Your Stripe publishable key (starts with `pk_`)

**Example:**

```
pk_live_xxxxxxxxxxxx
```

**How to get it:**

1. Go to <https://dashboard.stripe.com/apikeys>
2. Copy the "Publishable key" (use Test key for development)

---

#### 4. Sentry (error monitoring for frontend)

**Variable:** `NEXT_PUBLIC_SENTRY_DSN`

**Value:** Your Sentry DSN for client-side monitoring

**Example:**

```
https://xxxxxxxxxxxxx@o123456.ingest.sentry.io/123456
```

---

## Step 3: Environment Scope

For each variable you add, select the environments:

- ✅ **Production** (required)
- ✅ **Preview** (recommended - for PR previews)
- ⬜ **Development** (optional - usually use local .env)

---

## Step 4: Trigger Redeploy

After adding variables:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete (~2-3 minutes)

---

## Step 5: Verify Frontend

After deployment:

1. Visit your Vercel deployment URL (e.g., `https://yourdomain.vercel.app`)
2. Open browser DevTools (F12)
3. Check the Console tab for any API connection errors
4. Verify the site loads correctly

**Test API connection:**

1. Try logging in or creating an account (if those features exist)
2. Check Network tab in DevTools
3. Verify requests are going to your Railway API URL

---

## Configuration Summary

### Minimum Required (Production)

```env
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-URL.up.railway.app
```

### Full Configuration (All Features)

```env
# API
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-URL.up.railway.app

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Payments (optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx

# Monitoring (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxx@o123456.ingest.sentry.io/123456
```

---

## Troubleshooting

### "Failed to fetch" or API connection errors

**Problem:** Frontend can't connect to backend API

**Solutions:**

1. Verify `NEXT_PUBLIC_API_URL` is correct (check Railway dashboard)
2. Make sure Railway API is healthy (visit `/health` endpoint)
3. Check Railway logs for CORS errors
4. Verify Railway service is publicly accessible (not sleeping)

### Environment variables not updating

**Problem:** Changed variables but site still uses old values

**Solutions:**

1. Redeploy the site (Vercel caches build-time env vars)
2. Clear Vercel build cache: Settings → General → "Clear Cache"
3. Wait a few minutes for CDN cache to clear

### CORS errors in browser console

**Problem:** "Access-Control-Allow-Origin" errors

**Solutions:**

1. Check Railway API has CORS configured for your Vercel domain
2. Verify `NEXT_PUBLIC_API_URL` doesn't have trailing slash
3. Check Railway logs for blocked requests

### Build fails with "Missing environment variable"

**Problem:** Build process requires env vars that aren't set

**Solutions:**

1. Check `packages/frontend/src/lib/env.ts` for required variables
2. Add missing variables to Vercel
3. Redeploy

---

## Custom Domain Setup (Optional)

To use a custom domain (e.g., `www.yourdomain.com`):

### For Frontend (Vercel):

1. Go to Vercel project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

### For API (Railway):

1. Go to Railway project → agent-api service → Settings
2. Scroll to "Public Networking"
3. Click "Add Custom Domain"
4. Enter your API subdomain (e.g., `api.yourdomain.com`)
5. Update your DNS provider with Railway's CNAME record
6. Update Vercel's `NEXT_PUBLIC_API_URL` to `https://api.yourdomain.com`
7. Redeploy Vercel

---

## Testing Checklist

After configuration:

- [ ] Frontend loads without errors
- [ ] No console errors in browser DevTools
- [ ] API requests go to correct Railway URL
- [ ] Health check responds: `https://YOUR-RAILWAY-URL/health`
- [ ] Authentication works (login/signup if applicable)
- [ ] All features that require API work correctly

---

## Security Notes

- ✅ All `NEXT_PUBLIC_*` variables are safe to expose (client-side)
- ⚠️ Never put secret keys in `NEXT_PUBLIC_*` variables
- ✅ Vercel automatically serves frontend over HTTPS
- ✅ Railway API uses TLS for all database connections

---

## Next Steps

1. ✅ Configure Railway (see RAILWAY_CONFIG.md)
2. ✅ Configure Vercel (this guide)
3. 🚀 Set up CI/CD for automated deployments
4. 📊 Add monitoring (Sentry)
5. 🔒 Set up custom domain
6. 📈 Configure analytics
