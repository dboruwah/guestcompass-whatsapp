import { QueueAdapter } from '@/services/messaging/queueAdapter'
import type { QueueJob } from '@/services/messaging/types'
import { eventBus } from '@/events/eventBus'
import { tokenBucket } from '@/ratelimiter/inMemoryTokenBucket'
import { tryConsumeRedis } from '@/ratelimiter/redisTokenBucket'
import { WhatsAppAPI } from '@/services/whatsapp/api'

export function registerSenderWorker() {
  QueueAdapter.registerHandler('send_message', async (job: QueueJob) => {
    console.log('Sender worker processing', job.id)
    const recId = job.payload?.campaign_recipient_id
    const phone = job.payload?.to || job.payload?.phone

    if (WhatsAppAPI.isConfigured() && phone) {
      try {
        const normalizedPhone = WhatsAppAPI.formatPhoneNumber(phone)
        const result = await WhatsAppAPI.sendMessage(normalizedPhone, job.payload?.text || job.payload?.message || '')
        const whatsappId = result.messages?.[0]?.id || `meta.${job.id}`

        if (recId) {
          try {
            const repo = (await import('@/services/messaging/repository')).MessagingRepository
            await repo.updateCampaignRecipient(recId, { whatsapp_message_id: whatsappId, status: 'sent' })
          } catch (err) {
            console.error('failed to update campaign_recipient after real send', err)
          }
        }

        eventBus.emitDelivery({
          whatsapp_message_id: whatsappId,
          status: 'sent',
          timestamp: new Date().toISOString(),
          raw: { meta: true, job },
        })
        return
      } catch (err) {
        console.error('WhatsApp API send failed', err)
        const failId = `failed.${job.id}`
        if (recId) {
          try {
            const repo = (await import('@/services/messaging/repository')).MessagingRepository
            await repo.updateCampaignRecipient(recId, { status: 'failed' })
          } catch (updateErr) {
            console.error('failed to mark recipient failed', updateErr)
          }
        }
        eventBus.emitDelivery({
          whatsapp_message_id: failId,
          status: 'failed',
          timestamp: new Date().toISOString(),
          raw: { meta: true, error: String(err), job },
        })
        return
      }
    }

    const whatsappId = `sim.${job.id}`
    if (recId) {
      try {
        const repo = (await import('@/services/messaging/repository')).MessagingRepository
        await repo.updateCampaignRecipient(recId, { whatsapp_message_id: whatsappId, status: 'sending' })
      } catch (err) {
        console.error('failed to update campaign_recipient before send', err)
      }
    }

    const businessKey = job.business_id || 'global'
    let rl
    try {
      rl = await tryConsumeRedis(businessKey, 1, 50, 50)
    } catch (err) {
      rl = tokenBucket.tryConsume(businessKey, 1, 50, 50)
    }
    if (!rl.allowed) {
      console.log('Rate limit hit for', businessKey, 'waiting', rl.waitMs)
      setTimeout(() => {
        QueueAdapter.enqueue({ ...job, scheduled_at: new Date(Date.now() + (rl.waitMs || 1000)).toISOString() })
      }, rl.waitMs || 1000)
      return
    }

    eventBus.emitDelivery({ whatsapp_message_id: whatsappId, status: 'sent', timestamp: new Date().toISOString(), raw: { simulated: true, job } })
    setTimeout(() => {
      eventBus.emitDelivery({ whatsapp_message_id: whatsappId, status: 'delivered', timestamp: new Date().toISOString(), raw: { simulated: true, job } })
    }, 2500)

    if (recId) {
      try {
        const repo = (await import('@/services/messaging/repository')).MessagingRepository
        await repo.updateCampaignRecipient(recId, { status: 'sent', whatsapp_message_id: whatsappId })
      } catch (err) {
        console.warn('failed to mark recipient sent', err)
      }
    }
  })
}
