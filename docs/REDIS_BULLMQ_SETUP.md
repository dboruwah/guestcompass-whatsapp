# Redis + BullMQ Setup Guide

## Quick Start (Docker Compose)

### Prerequisites
- Docker and Docker Compose installed
- Redis and Postgres will be automatically started

### Start Services

```bash
cd C:\Whatsapp API
docker-compose -f docker-compose.dev.yml up -d
```

### Verify Connection

```bash
# Check Redis
redis-cli ping
# Should output: PONG

# Check Postgres
psql -h localhost -U user -d guestcompass -c "SELECT 1"
```

### Environment Variables

Create a `.env.local` with:

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NEW: Enable Redis/BullMQ
REDIS_URL=redis://localhost:6379
BULLMQ_QUEUE_NAME=gc_jobs
BULLMQ_CONCURRENCY=10

# Worker HTTP shim
WORKER_HTTP=1
WORKER_HTTP_PORT=9090
```

### Restart Dev Server

```bash
npm run dev
```

The app will now:
1. Detect REDIS_URL
2. Use BullAdapter instead of in-memory queue
3. Start registering workers when QueueAdapter is used
4. Expose metrics at `/api/metrics` and `/health/*`

## BullMQ Architecture

```
Browser/API
    ↓
QueueAdapter (detects REDIS_URL)
    ↓
BullAdapter (if Redis available)
    ├→ Redis Queue (persistent job store)
    ├→ Bull Worker (processes jobs)
    ├→ Job Retry (exponential backoff)
    └→ Dead Letter Queue (failed jobs)

In-Memory Queue (fallback, no Redis)
    ├→ Process-local jobs
    ├→ Automatic job execution
    └→ Good for dev/demo mode
```

## Running Workers

### Development

```bash
npm run build:workers
node scripts/startWorkers.ts
```

This will:
1. Compile TypeScript workers to dist-workers/
2. Start the worker process
3. Register job handlers (send_message, campaign_batch)
4. Begin processing jobs from Redis queue

### Production (Docker)

```bash
docker build -f Dockerfile.worker -t myrepo/guestcompass-worker:latest .
docker run -e REDIS_URL=redis://redis:6379 -e NODE_ENV=production myrepo/guestcompass-worker:latest
```

## Monitoring

### Metrics Endpoint

```bash
curl http://localhost:3000/api/metrics
```

Returns Prometheus metrics:
- `gc_jobs_processed_total` - jobs completed
- `gc_jobs_failed_total` - jobs failed  
- `gc_queue_length` - waiting + delayed + active jobs
- `gc_dlq_length` - dead-letter queue size

### BullMQ Dashboard (optional)

Install Bull Board for visual monitoring:

```bash
npm install --save-dev @bull-board/express @bull-board/ui
```

See docs/BULL_BOARD_SETUP.md for integration.

## Troubleshooting

### "Can't resolve 'bullmq'"

Make sure BullMQ is installed:
```bash
npm install bullmq@^3.14.0 ioredis@^5.3.1
```

### Redis Connection Refused

Check Redis is running:
```bash
redis-cli ping  # should return PONG
```

Or with Docker:
```bash
docker logs guestcompass_redis
```

### Workers Not Processing Jobs

Ensure workers are running in a separate process:
```bash
npm run build:workers
node dist-workers/scripts/startWorkers.js
```

And that REDIS_URL is set in the environment where workers are running.

## Next Steps

1. ✅ Test workflows (in-memory) - DONE
2. ⏳ Set up real Supabase credentials
3. ⏳ Deploy worker container to production
4. ⏳ Add monitoring/alerting
