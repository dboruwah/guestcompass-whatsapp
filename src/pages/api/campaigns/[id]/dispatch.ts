import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { MessagingRepository } from '@/services/messaging/repository'
import { QueueAdapter } from '@/services/messaging/queueAdapter'

/**
 * POST /api/campaigns/:id/dispatch
 * Body: { sample: boolean }
 * Server-side dispatch: resolves audience (simple sample here), creates campaign_run, campaign_recipients, enqueues batches
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.query as { id: string }
  const supabase = (await createServerSupabaseClient()) as any
  const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', id).single()
  if (!campaign) return res.status(404).json({ error: 'campaign not found' })

  // Resolve audience: for now take campaign_recipients if already present; otherwise sample contacts
  let recipients: any[] = []
  const { data: existing } = await supabase.from('campaign_recipients').select('*').eq('campaign_id', id)
  if (existing && existing.length > 0) {
    recipients = existing
  } else {
    // sample opt-in contacts for the demo
    const { data: contacts } = await supabase.from('contacts').select('*').eq('business_id', campaign.business_id).limit(500)
    recipients = (contacts || []).map((c: any) => ({ contact_id: c.id, phone: c.phone }))
    // bulk insert campaign recipients (we'll store minimal rows)
    const inserted = await MessagingRepository.createCampaignRecipients(recipients.map((r) => ({ campaign_id: id, contact_id: r.contact_id })))
    // attach campaign_recipient_id back to recipients
    recipients = (recipients || []).map((r: any, idx: number) => ({ ...r, campaign_recipient_id: inserted[idx]?.id }))
  }

  // Create campaign run
  const run = await MessagingRepository.createCampaignRun(id, recipients.length)

  // Enqueue batches server-side
  const batchSize = 100
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    await QueueAdapter.enqueue({
      business_id: campaign.business_id,
      campaign_id: id,
      job_type: 'campaign_batch',
      payload: { run_id: run?.id || null, batch_index: Math.floor(i / batchSize), recipients: batch },
      priority: 0,
    })
  }

  // respond with run info
  res.status(200).json({ run_id: run?.id, total: recipients.length })
}
