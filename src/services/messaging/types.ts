export type JobType = 'send_message' | 'process_delivery' | 'webhook_event' | 'campaign_batch'

export type QueueJob<T = any> = {
  id: string
  business_id?: string | null
  campaign_id?: string | null
  job_type: JobType
  payload: T
  priority?: number
  attempts?: number
  max_attempts?: number
  scheduled_at?: string | null
}

export type MessageStatus =
  | 'draft'
  | 'queued'
  | 'processing'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'replied'
  | 'failed'
  | 'retrying'
  | 'cancelled'

export type DeliveryEvent = {
  whatsapp_message_id?: string
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'replied'
  timestamp?: string
  raw?: any
}

export type CampaignRecipient = {
  id: string
  campaign_id: string
  contact_id: string
  status?: string
  whatsapp_message_id?: string | null
}
