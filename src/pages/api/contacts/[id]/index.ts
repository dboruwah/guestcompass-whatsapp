import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  if (req.method !== 'GET') return res.status(405).end()

  const { data, error } = await ADMIN.from('contacts').select('*').eq('id', id).maybeSingle()

  if (error) return res.status(500).json({ error: error.message })
  if (!data) return res.status(404).json({ error: 'Contact not found' })

  const { data: activity } = await ADMIN.from('contact_activity_logs')
    .select('*')
    .eq('contact_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  res.status(200).json({ ...data, activity: activity || [] })
}
