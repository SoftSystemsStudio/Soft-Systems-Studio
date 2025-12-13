#!/bin/bash
# Seed production database on Railway
# This script runs Prisma migrations and seeds on the remote database

set -e

echo "🌱 Seeding production database..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$RAILWAY_DATABASE_URL" ]; then
  echo "❌ Error: RAILWAY_DATABASE_URL environment variable not set"
  echo "   Get it from: Railway dashboard → PostgreSQL service → Connect → Connection URL"
  exit 1
fi

# Set DATABASE_URL for Prisma
export DATABASE_URL="$RAILWAY_DATABASE_URL"

# Basic validation to avoid Prisma's confusing init errors
case "$DATABASE_URL" in
  postgresql://*|postgres://*)
    ;;
  *)
    echo "❌ Error: RAILWAY_DATABASE_URL must start with postgresql:// or postgres://"
    echo "   Got: ${DATABASE_URL:0:32}..."
    exit 1
    ;;
esac

# Navigate to agent-api
cd "$(dirname "$0")/../apps/agent-api"

echo "📦 Installing dependencies..."
pnpm install --silent

echo ""
echo "🔄 Pushing database schema..."
npx prisma db push --accept-data-loss

echo ""
echo "🌱 Running seed script..."
npx ts-node prisma/seed.ts

echo ""
echo "✅ Production database seeded successfully!"
echo ""
echo "🎉 Your API is ready! Test it:"
echo "   curl -X POST https://apps-agent-api-production.up.railway.app/api/v1/public/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\":\"what services do you offer?\"}'"
