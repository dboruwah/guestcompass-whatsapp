import { eventBus } from '@/events/eventBus'
import { MessagingRepository } from './repository'

// Listen for events and persist to delivery logs + message_events
export function registerDeliveryTracker() {
  eventBus.onDelivery(async (ev) => {
    try {
      // Persist raw delivery log
      await MessagingRepository.persistDeliveryLog(null, ev.whatsapp_message_id, ev.status, ev.raw)

      // Record message event for analytics
      if (ev.whatsapp_message_id) {
        await MessagingRepository.recordMessageEvent(ev.whatsapp_message_id, ev.status, ev.raw)
      }

      // Map whatsapp_message_id -> campaign_recipient and update recipient status & campaign counters
      if (ev.whatsapp_message_id) {
        const recipient: any = await MessagingRepository.findCampaignRecipientByWhatsAppId(ev.whatsapp_message_id)
        if (recipient) {
          // update recipient row
          const updates: any = {}
          if (ev.status === 'delivered') updates.status = 'delivered'
          if (ev.status === 'sent') updates.status = 'sent'
          if (ev.status === 'read') updates.status = 'read'
          if (ev.status === 'failed') updates.status = 'failed'
          if (ev.status === 'replied') updates.status = 'replied'
          await MessagingRepository.updateCampaignRecipient(recipient.id, { ...updates })

          // increment campaign counters atomically (best effort)
          const counters: Record<string, number> = {}
          if (ev.status === 'delivered') counters['delivered_count'] = 1
          if (ev.status === 'read') counters['read_count'] = 1
          if (ev.status === 'failed') counters['failed_count'] = 1
          if (ev.status === 'replied') counters['replied_count'] = 1
          if (Object.keys(counters).length > 0) {
            await MessagingRepository.incrementCampaignCounters(recipient.campaign_id, counters)
          }
        }
      }
    } catch (err) {
      console.error('DeliveryTracker error', err)
    }
  })
}
