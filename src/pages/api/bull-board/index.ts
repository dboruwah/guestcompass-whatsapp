import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Bull Board endpoint - Visual queue monitoring
 * Only functional when Redis/BullMQ is configured
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hasRedis = !!(process.env.REDIS_URL || process.env.REDIS_URI || process.env.REDIS)

  if (!hasRedis) {
    return res.status(200).json({
      available: false,
      message: 'Bull Board requires Redis. Set REDIS_URL env var and run: npm install bull-board',
    })
  }

  return res.status(200).json({
    available: true,
    message: 'Bull Board UI available when bull-board package is installed and Redis is connected',
  })
}
