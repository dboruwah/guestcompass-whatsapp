import type { NextApiRequest, NextApiResponse } from 'next'
import { QueueAdapter } from '@/services/messaging/queueAdapter'
import { eventBus } from '@/events/eventBus'

/**
 * Test workflow API - creates demo jobs and simulates message delivery
 * GET /api/test/workflow?action=start|status|reset
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action = 'start' } = req.query as { action: string }

  if (action === 'start') {
    const recipients = [
      { id: 'rec-1', phone: '+919876543210', name: 'Rahul' },
      { id: 'rec-2', phone: '+919876543211', name: 'Priya' },
      { id: 'rec-3', phone: '+919876543212', name: 'Amit' },
      { id: 'rec-4', phone: '+919876543213', name: 'Sneha' },
      { id: 'rec-5', phone: '+919876543214', name: 'Vikram' },
    ]

    const campaignId = 'demo-campaign-' + Date.now()
    const runId = 'demo-run-' + Date.now()

    await QueueAdapter.enqueue({
      business_id: 'demo-business',
      campaign_id: campaignId,
      job_type: 'campaign_batch',
      payload: {
        run_id: runId,
        batch_index: 0,
        recipients: recipients,
      },
      priority: 10,
    })

    for (let i = 0; i < recipients.length; i++) {
      await QueueAdapter.enqueue({
        business_id: 'demo-business',
        campaign_id: campaignId,
        job_type: 'send_message',
        payload: {
          campaign_recipient_id: `recipient-${i}`,
          phone: recipients[i].phone,
          text: `Namaste ${recipients[i].name}, this is a test message from GuestCompass!`,
        },
        priority: 5,
      })
    }

    setTimeout(() => {
      for (let i = 0; i < recipients.length; i++) {
        const whatsappId = `sim.msg.${i}`
        setTimeout(() => {
          eventBus.emitDelivery({
            whatsapp_message_id: whatsappId,
            status: 'sent',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            raw: { simulated: true },
          })
        }, 500 + i * 100)

        setTimeout(() => {
          eventBus.emitDelivery({
            whatsapp_message_id: whatsappId,
            status: 'delivered',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            raw: { simulated: true },
          })
        }, 2500 + i * 100)
      }
    }, 1000)

    return res.status(200).json({
      ok: true,
      campaignId,
      runId,
      jobsCreated: recipients.length + 1,
      locale: 'en-IN',
      timezone: 'Asia/Kolkata (IST)',
      message: 'Test campaign started - jobs queued and delivery events scheduled',
    })
  }

  if (action === 'status') {
    const pending = await QueueAdapter.listPending()
    return res.status(200).json({
      ok: true,
      queueLength: pending.length,
      jobs: pending.slice(0, 20),
    })
  }

  if (action === 'reset') {
    return res.status(200).json({
      ok: true,
      message: 'Queue will auto-clear after processing. Use refresh dashboard to see updates.',
    })
  }

  res.status(400).json({ error: 'Unknown action' })
}
