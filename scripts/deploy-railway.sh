#!/usr/bin/env bash
set -euo pipefail

echo "=== GuestCompass Railway Deploy ==="
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
  echo "Installing Railway CLI..."
  npm install -g @railway/cli
fi

# Login (if needed)
echo "Logging in to Railway..."
railway login

# Init project (first time only)
if [ ! -f "railway.json" ]; then
  echo "Initializing Railway project..."
  railway init
fi

# Set environment variables from .env.production
echo ""
echo "Setting environment variables..."
echo "⚠  Make sure your .env.production file has all required vars!"
echo "   Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY"
echo "   Optional: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, REDIS_URL"
echo ""

# Deploy
echo "Deploying to Railway..."
railway up --service app

echo ""
echo "=== Deploy complete! ==="
echo "Run 'railway open' to see your deployment."
