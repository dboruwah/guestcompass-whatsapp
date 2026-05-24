import { QueueAdapter } from './queueAdapter'
import type { QueueJob } from './types'
import { v4 as uuidv4 } from 'uuid'

/**
 * CampaignProcessor prepares campaign recipients and enqueues batch jobs.
 * This is intentionally storage-agnostic and uses the QueueAdapter.
 */
export const CampaignProcessor = {
  async prepareAndEnqueueBatch(campaignId: string, businessId: string, recipients: Array<{ contact_id: string, phone: string }>, batchSize = 100) {
    // chunk recipients into batches
    const batches: Array<Array<{ contact_id: string, phone: string }>> = []
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize))
    }

    const runId = uuidv4()

    await Promise.all(batches.map(async (batch, idx) => {
      const job: Omit<QueueJob, 'id'> = {
        business_id: businessId,
        campaign_id: campaignId,
        job_type: 'campaign_batch',
        payload: { run_id: runId, batch_index: idx, recipients: batch },
        priority: 0,
      }
      await QueueAdapter.enqueue(job)
    }))

    return { run_id: runId, batches: batches.length }
  },

  async cancelCampaignRun(runId: string) {
    // placeholder for cancellation: in a real system we'd mark message_queue rows as cancelled
    // and signal workers via pub/sub. For the in-memory queue we cannot cancel running jobs easily.
    console.warn('cancelCampaignRun stub', runId)
  }
}
