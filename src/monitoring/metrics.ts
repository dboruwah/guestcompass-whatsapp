import client from 'prom-client'

const register = client.register

// Wrap in try-catch to handle hot-reload double registration in dev
try {
  client.collectDefaultMetrics({ register })
} catch {
  // Metrics already registered (dev hot-reload) - that's fine
}

// Create custom metrics only if not already created
const getOrCreate = <T>(name: string, factory: () => T): T => {
  return (register.getSingleMetric(name) as T) || factory()
}

const jobsProcessed = getOrCreate('gc_jobs_processed_total', () => new client.Counter({ name: 'gc_jobs_processed_total', help: 'Total jobs processed' }))
const jobsFailed = getOrCreate('gc_jobs_failed_total', () => new client.Counter({ name: 'gc_jobs_failed_total', help: 'Total jobs failed' }))
const queueLength = getOrCreate('gc_queue_length', () => new client.Gauge({ name: 'gc_queue_length', help: 'Approximate queue length (memory or redis waiting)' }))
const dlqLength = getOrCreate('gc_dlq_length', () => new client.Gauge({ name: 'gc_dlq_length', help: 'Dead-letter queue length' }))

export { jobsProcessed, jobsFailed, queueLength, dlqLength }

export function setQueueLength(n: number) { 
  if (queueLength) queueLength.set(n) 
}

export function setDLQLength(n: number) { 
  if (dlqLength) dlqLength.set(n) 
}

export function metricsHandler(req: any, res: any) {
  res.setHeader('Content-Type', register.contentType)
  register.metrics().then((m) => res.end(m)).catch((e) => res.status(500).end(e))
}

