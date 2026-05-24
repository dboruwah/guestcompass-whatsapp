import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data } = await ADMIN.from('businesses').select('*').limit(1).maybeSingle()
    const { count: templateCount } = await ADMIN.from('template_library').select('*', { count: 'exact', head: true })
    return res.status(200).json({ business: data || null, templates_count: templateCount ?? 0 })
  }

  if (req.method === 'PUT') {
    const { data: existing } = await ADMIN.from('businesses').select('id').limit(1).maybeSingle()
    if (!existing) return res.status(404).json({ error: 'No business found' })

    const { error } = await ADMIN.from('businesses').update(req.body).eq('id', existing.id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
