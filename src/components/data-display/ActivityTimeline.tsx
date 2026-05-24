"use client"

import { cn } from "@/lib/utils/cn"
import { formatRelativeDate } from "@/lib/utils/date"
import {
  MessageSquare,
  Send,
  UserPlus,
  Tag,
  Mail,
  DollarSign,
  Phone,
  type LucideIcon,
} from "lucide-react"

interface ActivityEvent {
  id: string
  type: "message_received" | "message_sent" | "opt_in" | "opt_out" | "tag_added" | "tag_removed" | "campaign_sent" | "campaign_replied" | "converted" | "note_added" | "assigned" | "unassigned"
  title: string
  description?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

const ICONS: Record<ActivityEvent["type"], LucideIcon> = {
  message_received: MessageSquare,
  message_sent: Send,
  opt_in: UserPlus,
  opt_out: UserPlus,
  tag_added: Tag,
  tag_removed: Tag,
  campaign_sent: Mail,
  campaign_replied: MessageSquare,
  converted: DollarSign,
  note_added: MessageSquare,
  assigned: Phone,
  unassigned: Phone,
}

const COLORS: Record<ActivityEvent["type"], string> = {
  message_received: "text-blue-400 bg-blue-400/10",
  message_sent: "text-emerald-400 bg-emerald-400/10",
  opt_in: "text-green-400 bg-green-400/10",
  opt_out: "text-red-400 bg-red-400/10",
  tag_added: "text-amber-400 bg-amber-400/10",
  tag_removed: "text-muted-foreground bg-secondary",
  campaign_sent: "text-purple-400 bg-purple-400/10",
  campaign_replied: "text-blue-400 bg-blue-400/10",
  converted: "text-accent bg-accent/10",
  note_added: "text-muted-foreground bg-secondary",
  assigned: "text-cyan-400 bg-cyan-400/10",
  unassigned: "text-muted-foreground bg-secondary",
}

interface ActivityTimelineProps {
  events: ActivityEvent[]
  className?: string
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn("text-center py-12 text-sm text-muted-foreground", className)}>
        No activity recorded yet
      </div>
    )
  }

  return (
    <div className={cn("space-y-0", className)}>
      {events.map((event, i) => {
        const Icon = ICONS[event.type]
        const color = COLORS[event.type]
        return (
          <div key={event.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div className={cn("rounded-full p-1.5 shrink-0", color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {i < events.length - 1 && (
                <div className="w-px h-full bg-border group-last:hidden" />
              )}
            </div>
            <div className="pb-6 min-w-0">
              <p className="text-sm font-medium">{event.title}</p>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(event.timestamp)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
