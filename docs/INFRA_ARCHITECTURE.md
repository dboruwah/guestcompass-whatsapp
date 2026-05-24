# Messaging Infrastructure Design (Summary)

This document summarizes the core infrastructure items added to support enterprise messaging, the rationale, and next steps for production hardening.

Key Components Added

- In-memory Queue Adapter (src/queue/inMemoryQueue.ts)
- QueueAdapter shim for future BullMQ/Redis integration
- EventBus (src/events/eventBus.ts) as an intra-process event bus
- CampaignProcessor (prepares batches and enqueues jobs)
- SenderWorker (simulated) + CampaignBatchWorker
- DeliveryTracker that persists delivery receipts to delivery_logs and message_events
- Webhook receiver stub + API route for WhatsApp-style webhooks
- DB Migration: messaging infra (message_queue, message_events, delivery_logs, webhook_events, processing_batches, template_library, campaign_runs, event_logs)

Design principles

- Decouple orchestration (campaign processor) from execution (workers)
- Keep a thin queue adapter interface so BullMQ/Redis can be swapped without rewriting the business logic
- Persist raw webhook events and delivery logs for replay and audit
- Emit normalized events through an event bus for analytics and background processors
- Keep workers stateless and idempotent; use DB for durable state and deduplication

Production Hardening Checklist

1. Replace InMemoryQueue with BullMQ + Redis and support horizontal workers.
2. Implement token-bucket rate limiting per business using Redis.
3. Add idempotency keys and dedupe logic for webhook and delivery processing.
4. Implement OpenTelemetry tracing and structured logs.
5. Harden webhooks: signature verification, replay window, dedupe, and metrics.
6. Add partitioning for event tables and retention/archival policies.
7. Add metrics (Prometheus) + logging (Loki/ELK) + alerting (PagerDuty/Slack).
8. Create worker supervisor configs (systemd / k8s deployments / ECS tasks) and health checks.
