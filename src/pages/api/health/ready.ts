import { WhatsAppAPI } from '@/services/whatsapp/api'

export default function handler(req: any, res: any) {
  const whatsappConfigured = WhatsAppAPI.isConfigured()
  res.status(200).json({
    ready: true,
    whatsapp: {
      configured: whatsappConfigured,
      hint: whatsappConfigured ? undefined : 'Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in env',
    },
  })
}
