import IORedis from 'ioredis'
import { Queue, Worker, JobsOptions, Job } from 'bullmq'
import { jobsProcessed, jobsFailed, setQueueLength } from '@/monitoring/metrics'
import type { QueueJob } from '@/services/messaging/types'

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDIS
const QUEUE_NAME = process.env.BULLMQ_QUEUE_NAME || 'gc_jobs'

let connection: IORedis | null = null
let queue: Queue | null = null
let worker: Worker | null = null
const handlers = new Map<string, (job: QueueJob) => Promise<void>>()

function initRedis() {
  if (!REDIS_URL) throw new Error('REDIS_URL is not configured')
  if (!connection) connection = new IORedis(REDIS_URL)
  if (!queue) queue = new Queue(QUEUE_NAME, { connection })
}

function ensureWorker() {
  if (worker) return
  if (!connection) initRedis()
  worker = new Worker(
    QUEUE_NAME,
    async (bJob: Job) => {
      const jobData = bJob.data as QueueJob
      const h = handlers.get(bJob.name) || handlers.get(jobData.job_type)
      if (!h) {
        console.warn('No handler registered for job', bJob.name || jobData.job_type)
        return
      }
      await h(jobData)
    },
    { connection: connection!, concurrency: +(process.env.BULLMQ_CONCURRENCY || '10') },
  )

  worker.on('failed', (job, err) => {
    console.error('Bull worker job failed', job?.id, err)
    jobsFailed.inc(1)
  })
  worker.on('completed', () => {
    jobsProcessed.inc(1)
  })
}

export const BullAdapter = {
  async enqueue(job: Omit<QueueJob, 'id'>) {
    initRedis()
    if (!queue) throw new Error('Bull queue not initialized')
    const delay = job.scheduled_at ? Math.max(0, new Date(job.scheduled_at).getTime() - Date.now()) : 0
    const opts: JobsOptions = {
      attempts: job.max_attempts || 5,
      priority: job.priority || undefined,
      delay: delay || undefined,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 3600 },
      removeOnFail: false,
    }
    let jobId: string | undefined = undefined
    try {
      const payload: any = job.payload || {}
      if (job.job_type === 'send_message' && payload.campaign_recipient_id) jobId = `${job.job_type}:${payload.campaign_recipient_id}`
      if (job.job_type === 'campaign_batch' && payload.run_id !== undefined && payload.batch_index !== undefined) jobId = `${job.job_type}:${payload.run_id}:${payload.batch_index}`
    } catch {
      // ignore
    }
    if (jobId) opts.jobId = jobId
    const added = await queue.add(job.job_type, job, opts)
    return { id: added.id, ...job }
  },

  async moveToDeadLetter(jobId: string, reason?: string) {
    initRedis()
    if (!queue) return
    try {
      const job = await queue.getJob(jobId)
      if (!job) return
      const dlq = new Queue(`${QUEUE_NAME}:dlq`, { connection: connection! })
      await dlq.add(job.name + ':dlq', job.data, { removeOnComplete: { age: 86400 } })
      await job.remove()
    } catch (err) {
      console.error('moveToDeadLetter error', err)
    }
  },

  registerHandler(jobType: string, handler: (job: QueueJob) => Promise<void>) {
    handlers.set(jobType, handler)
    try {
      ensureWorker()
    } catch (err) {
      console.error('Failed to start Bull worker', err)
    }
  },

  async listPending() {
    initRedis()
    if (!queue) return []
    const waiting = await queue.getWaitingCount()
    const delayed = await queue.getDelayedCount()
    const active = await queue.getActiveCount()
    const total = waiting + delayed + active
    setQueueLength(total)
    const jobs = await queue.getJobs(['waiting', 'delayed', 'active'], 0, 1000)
    return jobs.map((j) => ({ id: j.id, name: j.name, data: j.data }))
  },

  async close() {
    try {
      await worker?.close()
      await queue?.close()
      await connection?.disconnect()
    } catch (err) {
      console.warn('Error closing BullAdapter', err)
    }
  },
}
