import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { data, error } = await ADMIN.from('staff')
    .select('*, profiles:user_id(id, email, full_name, avatar_url, role)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('staff list error:', error)
    return res.status(500).json({ error: error.message })
  }

  const { count } = await ADMIN.from('staff').select('*', { count: 'exact', head: true })

  res.status(200).json({ staff: data || [], total: count ?? 0 })
}
