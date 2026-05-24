import type { NextApiRequest, NextApiResponse } from 'next'
import { WhatsAppAPI } from '@/services/whatsapp/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!WhatsAppAPI.isConfigured()) {
    return res.status(503).json({ error: 'WhatsApp API not configured', hint: 'Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID' })
  }

  const { token, phoneNumberId, apiVersion } = WhatsAppAPI.getConfig()

  if (req.method === 'GET') {
    try {
      const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/message_templates`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) {
        const err = await response.text()
        return res.status(response.status).json({ error: `Meta API error: ${err}` })
      }

      const data = await response.json()
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, language, category, components } = req.body

      if (!name || !language || !components) {
        return res.status(400).json({ error: 'Missing required fields: name, language, components' })
      }

      const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/message_templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          language,
          category: category || 'UTILITY',
          components,
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        return res.status(response.status).json({ error: `Meta API error: ${err}` })
      }

      const data = await response.json()
      return res.status(201).json(data)
    } catch (err) {
      return res.status(500).json({ error: String(err) })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
