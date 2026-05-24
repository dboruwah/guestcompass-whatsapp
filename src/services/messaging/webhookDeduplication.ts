/**
 * Webhook Deduplication & Replay Service
 * Stores webhook events with idempotency keys
 * Allows replaying webhooks for failed deliveries
 */

type WebhookEvent = {
  id: string
  webhook_event_id: string // External ID from WhatsApp
  received_at: string
  payload: Record<string, any>
  status: 'processed' | 'failed' | 'replayed'
  error?: string
  retry_count: number
}

class WebhookDeduplicationService {
  private seen = new Map<string, WebhookEvent>()

  /**
   * Check if webhook was already processed
   */
  isDuplicate(externalId: string): boolean {
    return this.seen.has(externalId)
  }

  /**
   * Record processed webhook
   */
  recordWebhook(event: WebhookEvent): void {
    this.seen.set(event.webhook_event_id, event)
    
    // Auto-cleanup old entries (>24h)
    setTimeout(() => {
      this.seen.delete(event.webhook_event_id)
    }, 24 * 60 * 60 * 1000)
  }

  /**
   * Get webhook for replay
   */
  getWebhook(id: string): WebhookEvent | undefined {
    return this.seen.get(id)
  }

  /**
   * Replay webhook
   */
  async replay(id: string, handler: (event: WebhookEvent) => Promise<void>): Promise<boolean> {
    const event = this.seen.get(id)
    if (!event) return false

    try {
      await handler(event)
      event.status = 'replayed'
      event.retry_count += 1
      return true
    } catch (err) {
      event.status = 'failed'
      event.error = String(err)
      event.retry_count += 1
      return false
    }
  }

  /**
   * Export for persistence to DB
   */
  export(): WebhookEvent[] {
    return Array.from(this.seen.values())
  }
}

export const webhookDeduplicator = new WebhookDeduplicationService()
