"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { StatCard } from "@/components/data-display/StatCard"
import { Users, Send, TrendingUp, MessageSquare, BarChart3, IndianRupee, Clock, UserPlus, Loader2 } from "lucide-react"

interface DashboardStats {
  timestamp: string
  timezone: string
  queue: { pending: number; dlq: number; total_processed: number }
  campaigns: { total: number; active: number; completed: number; scheduled: number }
  messages: { total_sent: number; delivered: number; read: number; failed: number; delivery_rate: number }
  contacts: { total: number; opted_in: number; opted_out: number }
  revenue: { total: number; currency: string; formatted: string }
  recent_activity: Array<{ action: string; time: string; type: string }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const s = stats || {
    contacts: { total: 0, opted_in: 0, opted_out: 0 },
    campaigns: { active: 0, total: 0, completed: 0, scheduled: 0 },
    messages: { total_sent: 0, delivery_rate: 0, read: 0, delivered: 0, failed: 0 },
    revenue: { formatted: "₹0.00", total: 0, currency: "INR" },
    recent_activity: [],
    queue: { pending: 0, dlq: 0, total_processed: 0 },
    timestamp: "",
    timezone: "",
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Dashboard"
        description={`WhatsApp marketing performance overview · India (IST) · ${s.timestamp}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Contacts" value={s.contacts.total.toLocaleString("en-IN")} icon={Users} />
        <StatCard label="Active Campaigns" value={String(s.campaigns.active)} icon={Send} />
        <StatCard label="Messages Sent" value={s.messages.total_sent.toLocaleString("en-IN")} icon={MessageSquare} />
        <StatCard label="Delivery Rate" value={`${s.messages.delivery_rate}%`} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Read Rate" value="—" icon={BarChart3} />
        <StatCard label="Opted In" value={s.contacts.opted_in.toLocaleString("en-IN")} icon={UserPlus} />
        <StatCard label="Revenue" value={s.revenue.formatted} icon={IndianRupee} />
        <StatCard label="Queue Pending" value={String(s.queue.pending)} icon={Clock} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
        {s.recent_activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        ) : (
          <div className="space-y-3">
            {s.recent_activity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{item.action}</span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {new Date(item.time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
