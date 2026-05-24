import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { search, limit, offset } = req.query

  let query = ADMIN.from('contacts').select('*', { count: 'exact' })

  if (search) {
    try {
      query = query.or(`phone.ilike.%${search}%,email.ilike.%${search}%`)
    } catch {
      query = query.or(`phone.ilike.%${search}%,email.ilike.%${search}%`)
    }
  }

  query = query.order('created_at', { ascending: false })
  if (limit) query = query.limit(parseInt(limit as string, 10))
  if (offset) query = query.offset(parseInt(offset as string, 10))

  const { data, error, count } = await query

  if (error) {
    console.warn('contacts error:', error)
    return res.status(200).json({ contacts: data || [], total: count ?? 0 })
  }

  res.status(200).json({ contacts: data || [], total: count ?? 0 })
}
