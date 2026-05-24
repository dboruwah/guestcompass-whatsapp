import type { NextApiRequest, NextApiResponse } from 'next'
import { QueueAdapter } from '@/services/messaging/queueAdapter'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pending = await QueueAdapter.listPending()
  res.status(200).json({ pending })
}
