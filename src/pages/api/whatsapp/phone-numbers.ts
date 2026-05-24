import type { NextApiRequest, NextApiResponse } from 'next'
import { WhatsAppAPI } from '@/services/whatsapp/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!WhatsAppAPI.isConfigured()) {
    return res.status(503).json({ error: 'WhatsApp API not configured', hint: 'Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID' })
  }

  const { token, phoneNumberId, apiVersion } = WhatsAppAPI.getConfig()

  if (req.method === 'GET') {
    try {
      const businessId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
      const endpoint = businessId
        ? `https://graph.facebook.com/${apiVersion}/${businessId}/phone_numbers`
        : `https://graph.facebook.com/${apiVersion}/${phoneNumberId}`

      const response = await fetch(endpoint, {
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
      const { phone_number, display_name, cc } = req.body

      if (!phone_number || !display_name) {
        return res.status(400).json({ error: 'Missing required fields: phone_number, display_name' })
      }

      const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          pin: req.body.pin || '',
        }),
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

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
