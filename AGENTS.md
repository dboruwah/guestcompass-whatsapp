<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Production Deployment
- **App**: https://guestcompass-whatsapp-production.up.railway.app
- **Worker**: Runs background jobs via BullMQ/Redis
- **Redis**: Internal Railway plugin
- **Login**: `admin@guestcompass.com` / `Admin123!`
- **Stack**: Dockerfile.app (app+worker dual mode via WORKER_MODE env var) + Dockerfile.worker (legacy)
- **Important**: Worker uses `module-alias` for @/ path resolution in compiled JS; _moduleAliases in package.json maps @ → dist-workers/src

# Deployed to Railway: https://guestcompass-whatsapp-production.up.railway.app
