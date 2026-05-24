import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }
  if (req.method !== 'GET') return res.status(405).end()

  const [convResult, messagesResult] = await Promise.all([
    ADMIN.from('conversations').select('*, contact:contact_id(id, first_name, last_name, phone)').eq('id', id).maybeSingle(),
    ADMIN.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true }).limit(200),
  ])

  if (convResult.error) return res.status(500).json({ error: convResult.error.message })
  if (!convResult.data) return res.status(404).json({ error: 'Conversation not found' })

  res.status(200).json({ ...convResult.data, messages: messagesResult.data || [] })
}
