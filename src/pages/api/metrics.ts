import { metricsHandler } from '@/monitoring/metrics'

export default function handler(req: any, res: any) {
  return metricsHandler(req, res)
}
