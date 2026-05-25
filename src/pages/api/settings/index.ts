import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data } = await ADMIN.from('businesses').select('*').limit(1).maybeSingle()

    let templates_count = 0
    try {
      const { count } = await ADMIN.from('whatsapp_templates').select('id', { count: 'exact', head: true })
      templates_count = count ?? 0
    } catch {
      try {
        const { count } = await ADMIN.from('template_library').select('id', { count: 'exact', head: true })
        templates_count = count ?? 0
      } catch {}
    }

    return res.status(200).json({ business: data || null, templates_count })
  }

  if (req.method === 'PUT') {
    const { data: existing } = await ADMIN.from('businesses').select('id').limit(1).maybeSingle()
    if (!existing) return res.status(404).json({ error: 'No business found' })

    const allowed = ['name', 'timezone', 'default_language', 'whatsapp_business_phone', 'settings']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const { data, error } = await ADMIN.from('businesses').update(updates).eq('id', existing.id).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ business: data })
  }

  return res.status(405).end()
}
