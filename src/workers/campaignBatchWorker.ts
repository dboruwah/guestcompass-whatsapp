import { QueueAdapter } from '@/services/messaging/queueAdapter'
import type { QueueJob } from '@/services/messaging/types'

/**
 * Batch worker — processes campaign_batch jobs and enqueues send_message jobs per recipient
 */
export function registerCampaignBatchWorker() {
  QueueAdapter.registerHandler('campaign_batch', async (job: QueueJob) => {
    console.log('Processing campaign batch', job.id)
    const recipients = job.payload.recipients || []
    // When campaign recipients exist, ensure we pass through campaign_recipient_id for tracking
    for (const r of recipients) {
      await QueueAdapter.enqueue({
        business_id: job.business_id,
        campaign_id: job.campaign_id,
        job_type: 'send_message',
        payload: { campaign_recipient_id: r.campaign_recipient_id || null, contact_id: r.contact_id, to: r.phone, template: job.payload.template || null },
        priority: 0,
      })
    }
  })
}
