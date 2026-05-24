"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useRealtimeMessages } from "@/lib/hooks/useRealtime"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, Loader2, Send } from "lucide-react"

export default function ConversationDetailPage() {
  const params = useParams()
  const conversationId = params?.conversationId as string | undefined
  const { messages, conversation, loading, sending, sendMessage } = useRealtimeMessages(conversationId)
  const [input, setInput] = useState("")

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(input)
    setInput("")
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  if (!conversation) {
    return (
      <div className="space-y-6 animate-in">
        <PageHeader title="Conversation not found" actions={<Link href="/inbox"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={`${conversation.contact?.first_name || ""} ${conversation.contact?.last_name || ""}`}
        description={`${conversation.contact?.phone || "unknown"} · ${conversation.status}`}
        actions={
          <Link href="/inbox">
            <Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-card flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Send a message to start the conversation.</p>
          ) : (
            messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.direction === "inbound" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[70%] rounded-xl p-3 ${msg.direction === "inbound" ? "bg-secondary" : "bg-accent text-accent-foreground"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-[10px] mt-1 opacity-70">
                    {new Date(msg.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-4">
          <form
            onSubmit={e => { e.preventDefault(); handleSend() }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 rounded-lg border border-input bg-secondary/50 py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <Button type="submit" disabled={!input.trim() || sending} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
