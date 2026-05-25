"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export function useRealtimeConversations() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) { setLoading(false); return }

    fetch("/api/conversations")
      .then(r => r.json())
      .then(data => setConversations(data.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    const channel = supabase
      .channel("conversations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === "INSERT") {
            setConversations(prev => [payload.new, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setConversations(prev =>
              prev.map(c => (c.id === payload.new.id ? { ...c, ...payload.new } : c)),
            )
          } else if (payload.eventType === "DELETE") {
            setConversations(prev => prev.filter(c => c.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    channelRef.current = channel
    return () => { channel.unsubscribe() }
  }, [])

  return { conversations, loading }
}

export function useRealtimeMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!conversationId) { setLoading(false); return }

    const supabase = createClient()
    if (!supabase) { setLoading(false); return }

    fetch(`/api/conversations/${conversationId}`)
      .then(r => r.json())
      .then(data => {
        setConversation(data)
        setMessages(data.messages || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          setMessages(prev => [...prev, payload.new])
        },
      )
      .subscribe()

    channelRef.current = channel
    return () => { channel.unsubscribe() }
  }, [conversationId])

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (!res.ok) throw new Error("Failed to send")
    } catch (err) {
      console.error("send error:", err)
    } finally {
      setSending(false)
    }
  }, [conversationId])

  return { messages, conversation, loading, sending, sendMessage }
}
