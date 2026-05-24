import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  let data = []
  let count = 0
  try {
    const { search } = req.query
    let query = ADMIN.from('audit_logs').select('*, profiles:actor_id(id, email, full_name)').order('created_at', { ascending: false }).limit(100)
    if (search) {
      query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%`)
    }
    const result = await query
    if (!result.error) {
      data = result.data || []
      const c = await ADMIN.from('audit_logs').select('*', { count: 'exact', head: true })
      count = c.count ?? 0
    }
  } catch (err) {
    console.warn('audit logs unavailable:', err)
  }

  res.status(200).json({ logs: data, total: count })
}
