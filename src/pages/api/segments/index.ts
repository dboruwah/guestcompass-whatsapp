import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  let data = []
  let count = 0
  try {
    const result = await ADMIN.from('segments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (!result.error) {
      data = result.data || []
      const c = await ADMIN.from('segments').select('*', { count: 'exact', head: true })
      count = c.count ?? 0
    }
  } catch (err) {
    console.warn('segments unavailable:', err)
  }

  res.status(200).json({ segments: data, total: count })
}
