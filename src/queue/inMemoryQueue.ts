import { v4 as uuidv4 } from 'uuid'
import type { QueueJob } from '@/services/messaging/types'
import { setQueueLength, setDLQLength } from '@/monitoring/metrics'

type Handler = (job: QueueJob) => Promise<void>

/**
 * Simple in-memory queue simulator with priorities, delayed jobs, retries.
 * Not for production — adapter-friendly so we can swap Redis/BullMQ later.
 */
export class InMemoryQueue {
  private queue: QueueJob[] = []
  private dlq: QueueJob[] = []
  private processing = false
  private handlers: Record<string, Handler> = {}

  registerHandler(jobType: string, handler: Handler) {
    this.handlers[jobType] = handler
  }

  async enqueue<T = any>(job: Omit<QueueJob<T>, 'id'>) {
    const id = uuidv4()
    const j: QueueJob = { id, attempts: 0, max_attempts: 5, ...job }
    this.queue.push(j)
    // sort by priority desc then created order
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0))
    // kick the processor
    // If a scheduled_at exists in the future, delay enqueue
    if (job.scheduled_at) {
      const t = new Date(job.scheduled_at).getTime()
      const now = Date.now()
      if (t > now) {
        const delay = t - now
        setTimeout(() => this.run(), delay + 50)
        return j
      }
    }
    this.run()
    setQueueLength(this.queue.length)
    return j
  }

  async run() {
    if (this.processing) return
    this.processing = true
    while (this.queue.length > 0) {
      const next = this.queue.shift()!
      if (!next) break
      const handler = this.handlers[next.job_type]
      if (!handler) {
        // unknown job type — mark failed
        // In a real system we'd persist this
        console.warn(`No handler for job type ${next.job_type}`)
        continue
      }
      try {
        await handler(next)
      } catch (err) {
        next.attempts = (next.attempts || 0) + 1
        if ((next.attempts || 0) < (next.max_attempts || 5)) {
          // exponential backoff to re-enqueue
          const delayMs = Math.min(60_000, 1000 * 2 ** next.attempts)
          setTimeout(() => this.queue.push(next), delayMs)
        } else {
          console.error('Job failed permanently', next, err)
          // move to dead-letter queue
          this.dlq.push(next)
          setDLQLength(this.dlq.length)
        }
      }
    }
    this.processing = false
    setQueueLength(this.queue.length)
  }

  // admin helpers
  listPending() {
    return this.queue.slice()
  }

  listDLQ() {
    return this.dlq.slice()
  }
}

export const defaultQueue = new InMemoryQueue()
