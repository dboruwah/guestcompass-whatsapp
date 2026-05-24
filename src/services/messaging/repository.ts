import { createAdminClient } from '@/lib/supabase/admin'
import type { DeliveryEvent } from './types'

let SUPABASE_CLIENT: ReturnType<typeof createAdminClient> | null = null

function getAdmin() {
  if (!SUPABASE_CLIENT) SUPABASE_CLIENT = createAdminClient()
  return SUPABASE_CLIENT
}

export const MessagingRepository = {
  async persistDeliveryLog(campaignRecipientId: string | null, whatsappMessageId: string | undefined, status: string, raw: any) {
    try {
      const supabase: any = getAdmin()
      await supabase.from('delivery_logs').insert({ campaign_recipient_id: campaignRecipientId, whatsapp_message_id: whatsappMessageId, status, raw_payload: raw })
    } catch (err) {
      console.error('persistDeliveryLog error', err)
    }
  },

  async recordMessageEvent(messageId: string, eventType: string, payload: any) {
    try {
      const supabase: any = getAdmin()
      const whatsappId = payload?.whatsapp_message_id || payload?.id || null
      const row: any = { message_id: messageId, event_type: eventType, payload }
      if (whatsappId) row.whatsapp_message_id = whatsappId
      await supabase.from('message_events').upsert(row, { onConflict: ['whatsapp_message_id', 'event_type'] })
    } catch (err) {
      console.error('recordMessageEvent error', err)
    }
  },

  async enqueueJob(job: any) {
    try {
      const supabase: any = getAdmin()
      await supabase.from('message_queue').insert(job)
    } catch (err) {
      console.error('enqueueJob error', err)
    }
  },

  async createCampaignRun(campaignId: string, totalRecipients: number) {
    try {
      const supabase: any = getAdmin()
      const { data, error } = await supabase.from('campaign_runs').insert({ campaign_id: campaignId, total_recipients: totalRecipients, queued_at: new Date().toISOString(), run_status: 'pending' }).select().single()
      if (error) throw error
      return data
    } catch (err) {
      console.error('createCampaignRun error', err)
      return null
    }
  },

  async createCampaignRecipients(rows: Array<{ campaign_id: string; contact_id: string; created_at?: string }>) {
    try {
      const supabase: any = getAdmin()
      const { data, error } = await supabase.from('campaign_recipients').insert(rows).select('*')
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('createCampaignRecipients error', err)
      return []
    }
  },

  async updateCampaignRecipient(recipientId: string, updates: Record<string, any>) {
    try {
      const supabase: any = getAdmin()
      const { data, error } = await supabase.from('campaign_recipients').update(updates).eq('id', recipientId).select().single()
      if (error) throw error
      return data
    } catch (err) {
      console.error('updateCampaignRecipient error', err)
      return null
    }
  },

  async findCampaignRecipientByWhatsAppId(whatsappId: string) {
    try {
      const supabase: any = getAdmin()
      const { data, error } = await supabase.from('campaign_recipients').select('*').eq('whatsapp_message_id', whatsappId).limit(1).maybeSingle()
      if (error) throw error
      return data
    } catch (err) {
      console.error('findCampaignRecipientByWhatsAppId error', err)
      return null
    }
  },

  async incrementCampaignCounters(campaignId: string, counters: Record<string, number>) {
    try {
      const supabase: any = getAdmin()
      const p = {
        p_campaign_id: campaignId,
        p_sent: counters['sent_count'] || 0,
        p_delivered: counters['delivered_count'] || 0,
        p_read: counters['read_count'] || 0,
        p_failed: counters['failed_count'] || 0,
        p_replied: counters['replied_count'] || 0,
        p_clicked: counters['clicked_count'] || 0,
        p_conversion: counters['conversion_count'] || 0,
      }
      await supabase.rpc('increment_campaign_counters', p)
    } catch (err) {
      console.error('incrementCampaignCounters error', err)
    }
  },
}
