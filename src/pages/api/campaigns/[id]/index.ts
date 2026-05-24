import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  if (req.method !== 'GET') return res.status(405).end()

  const { data, error } = await ADMIN.from('campaigns').select('*').eq('id', id).maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Campaign not found' })

  const { count: sentCount } = await ADMIN.from('campaign_recipients').select('*', { count: 'exact', head: true }).eq('campaign_id', id)
  const { count: failedCount } = await ADMIN.from('campaign_recipients').select('*', { count: 'exact', head: true }).eq('campaign_id', id).eq('status', 'failed')

  res.status(200).json({
    ...data,
    recipients: { total: sentCount ?? 0, failed: failedCount ?? 0 },
  })
}
