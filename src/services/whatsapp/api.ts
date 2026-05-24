import type { WhatsAppSendRequest, WhatsAppSendResponse } from './types'

const API_VERSION = 'v21.0'
const GRAPH_API = 'https://graph.facebook.com'

function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const webhookToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  const appSecret = process.env.WHATSAPP_APP_SECRET

  const isConfigured = !!(token && phoneNumberId)

  return { token, phoneNumberId, webhookToken, appSecret, isConfigured, apiVersion: process.env.WHATSAPP_API_VERSION || API_VERSION }
}

export const WhatsAppAPI = {
  isConfigured(): boolean {
    return getConfig().isConfigured
  },

  getConfig() {
    return getConfig()
  },

  async sendMessage(to: string, body: string): Promise<WhatsAppSendResponse> {
    const { token, phoneNumberId, apiVersion } = getConfig()
    if (!token || !phoneNumberId) throw new Error('WhatsApp API not configured')

    const payload: WhatsAppSendRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body, preview_url: false },
    }

    const res = await fetch(`${GRAPH_API}/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`WhatsApp API error ${res.status}: ${err}`)
    }

    return res.json()
  },

  async sendTemplate(to: string, templateName: string, language = 'en') {
    const { token, phoneNumberId, apiVersion } = getConfig()
    if (!token || !phoneNumberId) throw new Error('WhatsApp API not configured')

    const payload: WhatsAppSendRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language, policy: 'deterministic' },
      },
    }

    const res = await fetch(`${GRAPH_API}/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`WhatsApp API template error ${res.status}: ${err}`)
    }

    return res.json()
  },

  async sendInteractive(to: string, bodyText: string, buttons: Array<{ id: string; title: string }>) {
    const { token, phoneNumberId, apiVersion } = getConfig()
    if (!token || !phoneNumberId) throw new Error('WhatsApp API not configured')

    const payload: WhatsAppSendRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: { buttons: buttons.map(b => ({ type: 'reply' as const, reply: b })) },
      },
    }

    const res = await fetch(`${GRAPH_API}/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`WhatsApp API interactive error ${res.status}: ${err}`)
    }

    return res.json()
  },

  async markAsRead(messageId: string) {
    const { token, phoneNumberId, apiVersion } = getConfig()
    if (!token || !phoneNumberId) return

    await fetch(`${GRAPH_API}/${apiVersion}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    })
  },

  async uploadMedia(filePath: string, mimeType: string) {
    const { token, phoneNumberId, apiVersion } = getConfig()
    if (!token || !phoneNumberId) throw new Error('WhatsApp API not configured')

    const form = new FormData()
    const file = await import('fs').then(fs => fs.createReadStream(filePath))
    form.append('file', file as any)
    form.append('type', mimeType)
    form.append('messaging_product', 'whatsapp')

    const res = await fetch(`${GRAPH_API}/${apiVersion}/${phoneNumberId}/media`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form as any,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`WhatsApp API media error ${res.status}: ${err}`)
    }

    return res.json()
  },

  async verifyWebhook(mode: string | undefined, token: string | undefined, challenge: string | undefined): Promise<string | null> {
    const { webhookToken } = getConfig()
    if (mode === 'subscribe' && token === webhookToken && challenge) {
      return challenge
    }
    return null
  },

  async verifySignature(rawBody: string, signature: string | undefined): Promise<boolean> {
    if (!signature) return false
    const { appSecret } = getConfig()
    if (!appSecret) return false

    const crypto = await import('crypto')
    const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')
    return signature === expected
  },

  normalizePhoneNumber(phone: string): string {
    return phone.replace(/[^0-9]/g, '').replace(/^0+/, '')
  },

  formatPhoneNumber(phone: string): string {
    const cleaned = this.normalizePhoneNumber(phone)
    if (cleaned.length >= 10) return cleaned
    return `91${cleaned}`
  },
}
