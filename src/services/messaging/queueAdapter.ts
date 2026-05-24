import { defaultQueue } from '@/queue/inMemoryQueue'
import type { QueueJob } from '@/services/messaging/types'

const USE_BULL = !!(process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDIS)

/**
 * Queue adapter with a simple API that can be swapped to BullMQ/Redis later.
 * By default uses in-memory queue. If REDIS_URL is configured uses BullMQ.
 * BullAdapter is dynamically imported only when Redis is available.
 */
export const QueueAdapter = {
  async enqueue(job: Omit<QueueJob, 'id'>) {
    if (USE_BULL) {
      try {
        const { BullAdapter } = await import('@/queue/bullAdapter')
        return await BullAdapter.enqueue(job)
      } catch (e) {
        console.warn('BullMQ error, falling back to in-memory', e)
      }
    }
    return defaultQueue.enqueue(job)
  },

  registerHandler(jobType: string, handler: (job: QueueJob) => Promise<void>) {
    if (!USE_BULL) {
      return defaultQueue.registerHandler(jobType, handler)
    }
    // For Bull, this needs to be called at startup in workers
    // For now, just register in-memory
    return defaultQueue.registerHandler(jobType, handler)
  },

  async listPending() {
    if (USE_BULL) {
      try {
        const { BullAdapter } = await import('@/queue/bullAdapter')
        return await BullAdapter.listPending()
      } catch (e) {
        console.warn('BullMQ error, falling back to in-memory', e)
      }
    }
    return defaultQueue.listPending()
  },

  async close() {
    if (USE_BULL) {
      try {
        const { BullAdapter } = await import('@/queue/bullAdapter')
        return await BullAdapter.close()
      } catch (e) {
        console.warn('BullMQ error', e)
      }
    }
    return Promise.resolve()
  }
}
