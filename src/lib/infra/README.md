Messaging infrastructure scaffolding

What we added:

- Database migration: supabase/migrations/00002_messaging_infra.sql
- In-memory queue adapter (src/queue/inMemoryQueue.ts)
- Queue adapter shim for future BullMQ/Redis (src/services/messaging/queueAdapter.ts)
- EventBus (src/events/eventBus.ts)
- Campaign processor (src/services/messaging/campaignProcessor.ts)
- Sender worker (simulated) (src/workers/senderWorker.ts)
- Campaign batch worker (src/workers/campaignBatchWorker.ts)
- Delivery tracker that listens to EventBus and persists events (src/services/messaging/deliveryTracker.ts)
- Messaging repository to persist logs via Supabase admin client (src/services/messaging/repository.ts)
- Webhook receiver stub + API route (src/webhooks/whatsapp.ts, src/pages/api/webhooks/whatsapp.ts)
- Queue monitoring API (src/pages/api/queue/pending.ts)
- Zustand store for queue (src/stores/useQueueStore.ts)

Notes & next steps:

- The in-memory queue is a simulator; replace QueueAdapter implementation with BullMQ + Redis for production.
 - A BullMQ + Redis adapter was added at src/queue/bullAdapter.ts. Set REDIS_URL to enable it.
- Add RBAC and verification to webhook routes; implement signatures and replay protection.
- Implement mapping from whatsapp_message_id to campaign_recipient and update message statuses atomically.
- Add rate limiter / token bucket to sender workers and per-business throttling.
- Create worker entrypoints (e.g., node scripts or Docker images) and supervisor config.
- Add OpenTelemetry + structured logging + metrics and export to Prometheus/Loki.
