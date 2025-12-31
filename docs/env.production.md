# Production Environment Variables for softsystemsstudiollc.com
# Copy this file and fill in production values before deploying

# ======================
# VERCEL (Frontend)
# ======================
NEXT_PUBLIC_API_URL=https://api.softsystemsstudiollc.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_XXXXX
CLERK_SECRET_KEY=sk_live_XXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# ======================
# RAILWAY (API Backend)
# ======================
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://default:pass@host:6379
OPENAI_API_KEY=sk-XXXXX
QDRANT_URL=https://xxxxx.qdrant.io
QDRANT_API_KEY=XXXXX
STRIPE_SECRET_KEY=sk_live_XXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXX
SENDGRID_API_KEY=SG.XXXXX
TWILIO_ACCOUNT_SID=ACXXXXX
TWILIO_AUTH_TOKEN=XXXXX
