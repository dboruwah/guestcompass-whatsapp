import type { NextApiRequest, NextApiResponse } from 'next'
import { eventBus } from '@/events/eventBus'
import { WhatsAppAPI } from '@/services/whatsapp/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const challenge = await WhatsAppAPI.verifyWebhook(
      req.query['hub.mode'] as string | undefined,
      req.query['hub.verify_token'] as string | undefined,
      req.query['hub.challenge'] as string | undefined,
    )
    if (challenge) {
      res.status(200).send(challenge)
      return
    }
    res.status(400).send('Bad Request')
    return
  }

  if (req.method === 'POST') {
    try {
      const body = req.body
      const signature = (req.headers['x-hub-signature-256'] || req.headers['x-hub-signature']) as string | undefined

      const valid = await WhatsAppAPI.verifySignature(JSON.stringify(body), signature)
      if (!valid && process.env.WHATSAPP_APP_SECRET) {
        console.warn('webhook signature mismatch')
        res.status(401).json({ ok: false })
        return
      }

      try {
        const repo = (await import('@/services/messaging/repository')).MessagingRepository
        await repo.persistDeliveryLog(null, undefined, 'webhook_received', body)
      } catch (e) {
        console.warn('failed to persist raw webhook', e)
      }

      const value = body?.entry?.[0]?.changes?.[0]?.value

      const statuses = value?.statuses || []
      for (const s of statuses) {
        const whatsappId = s.id || s.message_id || s['message-id']
        eventBus.emitDelivery({
          whatsapp_message_id: whatsappId,
          status: s.status,
          timestamp: new Date(parseInt(s.timestamp) * 1000).toISOString(),
          raw: s,
        })
      }

      const messages = value?.messages || []
      for (const msg of messages) {
        eventBus.emit('message_received', {
          from: msg.from,
          message_id: msg.id,
          type: msg.type,
          timestamp: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
          text: msg.text?.body,
          raw: msg,
        })
      }

      res.status(200).json({ ok: true })
    } catch (err) {
      console.error('webhook error', err)
      res.status(500).json({ ok: false })
    }
    return
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
