/**
 * Development worker starter — imports and registers workers.
 * Run with: node scripts/startWorkers.js (compiled) or ts-node in dev
 */
// In production this file is compiled to dist-workers and executed in a dedicated container
// It registers worker handlers which will cause the BullAdapter to start the worker process.
const { registerSenderWorker } = require('../src/workers/senderWorker')
const { registerCampaignBatchWorker } = require('../src/workers/campaignBatchWorker')
const { registerDeliveryTracker } = require('../src/services/messaging/deliveryTracker')

registerSenderWorker()
registerCampaignBatchWorker()
registerDeliveryTracker()

console.log('Workers and trackers registered (production-ready).')

// If running in a worker container, optionally start a tiny HTTP server to expose metrics and health
if (process.env.WORKER_HTTP === '1') {
  const http = require('http')
  const { metricsHandler } = require('../src/monitoring/metrics')
  const server = http.createServer((req: any, res: any) => {
    if (req.url === '/healthz') return res.end('ok')
    if (req.url === '/ready') {
      // perform checks
      const { checkRedis } = require('../src/queue/redisHealth')
      checkRedis().then((r: any) => {
        if (r.ok) res.end('ready')
        else { res.statusCode = 500; res.end('redis: ' + (r.error || 'unknown')) }
      }).catch((e: any) => { res.statusCode = 500; res.end('error') })
      return
    }
    if (req.url === '/metrics') return metricsHandler(req, res)
    res.statusCode = 404
    res.end('not found')
  })
  const port = process.env.WORKER_HTTP_PORT || 9090
  server.listen(port, () => console.log('Worker HTTP shim listening on', port))
}
