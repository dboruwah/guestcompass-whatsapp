export type WhatsAppMessageType = 'text' | 'template' | 'interactive' | 'image' | 'document' | 'audio' | 'video' | 'sticker' | 'location' | 'contacts'

export interface WhatsAppTextMessage {
  body: string
  preview_url?: boolean
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button'
  parameters: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video'
    text?: string
    image?: { link: string }
    document?: { link: string }
    video?: { link: string }
    currency?: { fallback_value: string; code: string; amount_1000: number }
    date_time?: { fallback_value: string }
  }>
}

export interface WhatsAppTemplateMessage {
  name: string
  language: { code: string; policy?: 'deterministic' }
  components?: WhatsAppTemplateComponent[]
}

export interface WhatsAppInteractiveAction {
  button?: string
  buttons?: Array<{ type: 'reply'; reply: { id: string; title: string } }>
  sections?: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>
}

export interface WhatsAppInteractiveMessage {
  type: 'list' | 'button' | 'product' | 'product_list'
  header?: { type: 'text'; text: string }
  body?: { text: string }
  footer?: { text: string }
  action: WhatsAppInteractiveAction
}

export interface WhatsAppSendRequest {
  messaging_product: 'whatsapp'
  recipient_type: 'individual' | 'group'
  to: string
  type: WhatsAppMessageType
  text?: WhatsAppTextMessage
  template?: WhatsAppTemplateMessage
  interactive?: WhatsAppInteractiveMessage
}

export interface WhatsAppSendResponse {
  messaging_product: 'whatsapp'
  contacts: Array<{ input: string; wa_id: string }>
  messages: Array<{ id: string }>
}

export interface WhatsAppWebhookEntry {
  id: string
  changes: Array<{
    field: string
    value: {
      messaging_product: string
      metadata: { display_phone_number: string; phone_number_id: string }
      contacts?: Array<{ profile: { name: string }; wa_id: string }>
      messages?: Array<{
        from: string
        id: string
        timestamp: string
        type: string
        text?: { body: string }
        image?: { id: string; mime_type: string; sha256: string }
        interactive?: { type: string; button_reply?: { id: string; title: string }; list_reply?: { id: string; title: string } }
        context?: { from: string; id: string }
      }>
      statuses?: Array<{
        id: string
        status: string
        timestamp: string
        recipient_id: string
        conversation: { id: string; origin: { type: string } }
        pricing: { billable: boolean; pricing_model: string; category: string }
      }>
    }
  }>
}

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account'
  entry: WhatsAppWebhookEntry[]
}
