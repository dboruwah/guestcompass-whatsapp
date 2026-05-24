import type { NextApiRequest, NextApiResponse } from 'next'
import { webhookDeduplicator } from '@/services/messaging/webhookDeduplication'
import { eventBus } from '@/events/eventBus'

/**
 * Webhook management API
 * GET /api/webhooks - list recent webhooks
 * POST /api/webhooks/:id/replay - replay a webhook
 * DELETE /api/webhooks/:id - delete/ignore webhook
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, action } = req.query as { id?: string; action?: string }

  if (req.method === 'GET' && !id) {
    // List recent webhooks
    const webhooks = webhookDeduplicator.export()
    return res.status(200).json({
      total: webhooks.length,
      webhooks: webhooks.slice(-50), // last 50
    })
  }

  if (req.method === 'POST' && id && action === 'replay') {
    // Replay webhook
    try {
      const webhook = webhookDeduplicator.getWebhook(id as string)
      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' })
      }

      // Re-emit delivery events from webhook
      const statuses = webhook.payload?.entry?.[0]?.changes?.[0]?.value?.statuses || []
      for (const s of statuses) {
        eventBus.emitDelivery({
          whatsapp_message_id: s.id,
          status: s.status,
          timestamp: new Date(parseInt(s.timestamp) * 1000).toISOString(),
          raw: s,
        })
      }

      return res.status(200).json({ ok: true, retries: webhook.retry_count })
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  if (req.method === 'GET' && id) {
    // Get webhook details
    const webhook = webhookDeduplicator.getWebhook(id as string)
    return res.status(webhook ? 200 : 404).json(webhook || { error: 'Not found' })
  }

  res.status(405).end()
}
