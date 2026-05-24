import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { data, error } = await ADMIN.from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('campaigns list error:', error)
    return res.status(500).json({ error: error.message })
  }

  const { count } = await ADMIN.from('campaigns').select('*', { count: 'exact', head: true })

  res.status(200).json({ campaigns: data || [], total: count ?? 0 })
}
