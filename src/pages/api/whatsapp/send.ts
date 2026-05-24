import type { NextApiRequest, NextApiResponse } from 'next'
import { WhatsAppAPI } from '@/services/whatsapp/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  if (!WhatsAppAPI.isConfigured()) {
    return res.status(503).json({ error: 'WhatsApp API not configured', hint: 'Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID' })
  }

  try {
    const { to, text, type } = req.body
    if (!to || !text) {
      return res.status(400).json({ error: 'Missing required fields: to, text' })
    }

    const phone = WhatsAppAPI.formatPhoneNumber(to)

    let result
    if (type === 'template') {
      result = await WhatsAppAPI.sendTemplate(phone, text, req.body.language || 'en')
    } else if (type === 'interactive') {
      result = await WhatsAppAPI.sendInteractive(phone, text, req.body.buttons || [])
    } else {
      result = await WhatsAppAPI.sendMessage(phone, text)
    }

    return res.status(200).json(result)
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
