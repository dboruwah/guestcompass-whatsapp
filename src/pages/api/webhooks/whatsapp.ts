import whatsapp from '@/webhooks/whatsapp'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return whatsapp(req, res)
}
