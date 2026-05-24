import EventEmitter from 'events'
import type { DeliveryEvent } from '@/services/messaging/types'

/**
 * Lightweight EventBus for intra-process event dispatching. In prod this
 * should be backed by Redis Pub/Sub, Kafka, or another durable event bus.
 *
 * We use a singleton to make it easy to import and listen in workers and HTTP handlers.
 */
class EventBus extends EventEmitter {
  emitDelivery(event: DeliveryEvent) {
    this.emit('delivery', event)
  }

  onDelivery(handler: (e: DeliveryEvent) => void) {
    this.on('delivery', handler)
  }
}

// Export a single shared EventBus instance
export const eventBus = new EventBus()
