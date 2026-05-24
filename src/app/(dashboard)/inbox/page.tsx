"use client"

import Link from "next/link"
import { useRealtimeConversations } from "@/lib/hooks/useRealtime"
import { PageHeader } from "@/components/layout/PageHeader"
import { Search, MessageSquare, Loader2 } from "lucide-react"

export default function InboxPage() {
  const { conversations, loading } = useRealtimeConversations()

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="Inbox" description="Customer conversations and WhatsApp messaging" />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" placeholder="Search conversations..." className="w-full rounded-lg border border-input bg-secondary/50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</div>
          ) : (
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {conversations.map((conv: any) => (
                <Link key={conv.id} href={`/inbox/${conv.id}`} className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-accent">
                      {conv.contact?.first_name?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conv.contact?.first_name} {conv.contact?.last_name || conv.contact?.phone?.slice(-4) || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{conv.last_message_preview || "No messages yet"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {conv.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-accent text-[10px] font-medium text-accent-foreground px-1">
                        {conv.unread_count}
                      </span>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString("en-IN") : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card flex items-center justify-center p-12">
          <div className="text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Select a conversation to view messages</p>
          </div>
        </div>
      </div>
    </div>
  )
}
