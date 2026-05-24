import type { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const ADMIN: any = createAdminClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string }

  if (req.method === 'GET') {
    const { data, error } = await ADMIN.from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
      .limit(200)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ messages: data || [] })
  }

  if (req.method === 'POST') {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { content, content_type } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Content is required' })

    const { data: conv } = await ADMIN.from('conversations').select('id, contact_id').eq('id', id).maybeSingle()
    if (!conv) return res.status(404).json({ error: 'Conversation not found' })

    const { data: msg, error: msgErr } = await ADMIN.from('messages').insert({
      conversation_id: id,
      sender_id: user.id,
      sender_type: 'staff',
      direction: 'outbound',
      content: content.trim(),
      content_type: content_type || 'text',
      status: 'sent',
    }).select('id').single()

    if (msgErr) return res.status(500).json({ error: msgErr.message })

    await ADMIN.from('conversations').update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.trim().slice(0, 100),
      status: 'active',
    }).eq('id', id)

    await ADMIN.from('contact_activity_logs').insert({
      contact_id: conv.contact_id,
      action: 'message_sent',
      description: 'Staff sent a message',
      metadata: { message_id: msg?.id, conversation_id: id },
    })

    return res.status(201).json({ id: msg?.id, status: 'sent' })
  }

  return res.status(405).end()
}
