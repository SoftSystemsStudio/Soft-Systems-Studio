# 🚀 Deployment Quick Start Guide

Get your website running 24/7 in under 15 minutes!

---

## ✅ What We've Done So Far

1. **✅ Provisioned all database services**
   - PostgreSQL (Neon) - Connected and tested
   - Redis (Upstash) - Connected and tested
   - Qdrant Vector DB - Connected and tested

2. **✅ Generated secure secrets**
   - JWT_SECRET (512 bits)
   - ADMIN_API_KEY (256 bits)
   - CRON_SECRET (256 bits)

3. **✅ Created configuration guides**
   - Railway configuration (RAILWAY_CONFIG.md)
   - Vercel configuration (VERCEL_CONFIG.md)

---

## 🎯 What You Need To Do Now

### Step 1: Configure Railway (5 minutes)

**Option A: Web UI (Recommended)**

1. Open [RAILWAY_CONFIG.md](./RAILWAY_CONFIG.md) ⚠️ **This file is gitignored - contains secrets**
2. Go to <https://railway.app> → Your project → agent-api service → Variables tab
3. Copy-paste all environment variables from the "Quick Copy-Paste" section
4. **IMPORTANT:** Replace `YOUR_OPENAI_KEY_HERE` with your actual OpenAI API key
5. Click "Deploy" or wait for auto-deploy

**Option B: Railway CLI (Advanced)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set variables from file
railway variables --from-file .env.railway
```

---

### Step 2: Wait for Deployment (5-8 minutes)

1. Watch deployment logs in Railway dashboard
2. Wait for "Build succeeded" and "Deployment complete"
3. Railway will show your deployment URL

---

### Step 3: Verify Health Check (1 minute)

Visit your Railway health endpoint:

```
https://YOUR-RAILWAY-URL.up.railway.app/health
```

**Expected response:**

```json
{
  "status": "ok",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "qdrant": "healthy"
  }
}
```

**If you see this, your API is running 24/7!** 🎉

---

### Step 4: Configure Vercel (3 minutes)

1. Copy your Railway URL from Step 3
2. Open [VERCEL_CONFIG.md](./VERCEL_CONFIG.md)
3. Go to <https://vercel.com> → Your project → Settings → Environment Variables
4. Add `NEXT_PUBLIC_API_URL` = your Railway URL (without `/health`)
5. Redeploy Vercel

---

### Step 5: Test Your Website (2 minutes)

1. Visit your Vercel URL (e.g., `https://yoursite.vercel.app`)
2. Open browser DevTools (F12) → Console
3. Check for errors
4. Try any features that connect to the API

**If everything works, you're done!** 🚀

---

## 🔧 Troubleshooting

### Railway deployment keeps restarting

**Cause:** Missing or invalid environment variables

**Fix:**

1. Check Railway logs for specific error
2. Verify all required variables are set (see RAILWAY_CONFIG.md)
3. Most common: `OPENAI_API_KEY` not set or invalid

---

### Health check returns 503

**Cause:** One or more database services can't connect

**Fix:**

1. Verify DATABASE*URL, REDIS_URL, QDRANT*\* variables are correct
2. Check if Neon/Upstash/Qdrant services are online
3. Test locally: `node test-prod-connections.js`

---

### Frontend can't connect to API

**Cause:** CORS or wrong API URL

**Fix:**

1. Verify `NEXT_PUBLIC_API_URL` in Vercel matches Railway URL exactly
2. No trailing slash in URL
3. Check Railway logs for CORS errors
4. Redeploy Vercel after changing env vars

---

## 📋 Deployment Checklist

- [ ] All 3 database services provisioned and tested
- [ ] Railway environment variables configured
- [ ] OpenAI API key added to Railway
- [ ] Railway deployment succeeded
- [ ] Health check endpoint returns 200 OK
- [ ] Vercel environment variables configured
- [ ] Vercel deployment succeeded
- [ ] Frontend loads without errors
- [ ] API connection from frontend works

---

## 🔐 Security Checklist

- [ ] `RAILWAY_CONFIG.md` is in .gitignore (contains secrets)
- [ ] Never committed `.env` files to git
- [ ] JWT_SECRET is 64+ characters
- [ ] All database connections use TLS/SSL
- [ ] OpenAI API key has usage limits set
- [ ] Secrets are stored only in Railway/Vercel dashboards

---

## 📚 Next Steps (Optional)

After your site is running 24/7:

1. **Custom Domain**
   - Add custom domain to Vercel (frontend)
   - Add custom domain to Railway (api.yourdomain.com)
   - Update `NEXT_PUBLIC_API_URL` in Vercel

2. **Monitoring**
   - Add Sentry DSN for error tracking
   - Set up uptime monitoring (UptimeRobot, Pingdom)

3. **CI/CD Pipeline**
   - Configure GitHub Actions for auto-deploy
   - See `.github/workflows/ci-cd.yml`

4. **Scaling**
   - Enable Railway autoscaling
   - Add worker service for background jobs
   - Set up Redis queue for async tasks

---

## 📞 Need Help?

### Test Database Connections Locally

```bash
node test-prod-connections.js
```

This will verify all three services are reachable.

### Check Railway Logs

```bash
# Via CLI
railway logs

# Via Web
https://railway.app → Your project → Deployments → Logs
```

### Verify Environment Variables

```bash
# In Railway dashboard
Settings → Variables → Check all are set
```

---

## 💡 Pro Tips

1. **Railway's Raw Editor**: Use "Raw Editor" mode to paste all env vars at once
2. **Vercel Preview Deployments**: Add env vars to "Preview" environment too
3. **Database Backups**: Neon auto-backs up - verify in Neon dashboard
4. **Cost Monitoring**: Set up billing alerts in Railway/Upstash/Qdrant
5. **Health Monitoring**: Bookmark your `/health` endpoint for quick checks

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Health endpoint returns `"status": "ok"`
- ✅ All services show "healthy"
- ✅ Railway deployment doesn't restart/crash
- ✅ Frontend loads without console errors
- ✅ Can test API features from frontend
- ✅ Site stays online for 24+ hours without manual intervention

---

## 📄 Configuration Files Reference

| File                       | Purpose                         | Commit to Git? |
| -------------------------- | ------------------------------- | -------------- |
| `RAILWAY_CONFIG.md`        | Railway env vars (with secrets) | ❌ NO          |
| `VERCEL_CONFIG.md`         | Vercel setup guide              | ✅ Yes         |
| `DEPLOYMENT_QUICKSTART.md` | This file                       | ✅ Yes         |
| `.env.test-production`     | Test file for local validation  | ❌ NO          |
| `test-prod-connections.js` | Connection test script          | ❌ NO          |

---

**Ready to deploy?** Start with Step 1 above! 🚀
