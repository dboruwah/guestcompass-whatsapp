"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, Badge } from "@/components/ui"
import { DataTable, type Column } from "@/components/data-display"
import { formatCurrency } from "@/lib/utils/format"
import { formatDateTime } from "@/lib/utils/date"
import { Plus, Send, BarChart3, TrendingUp, CheckCircle2, Loader2 } from "lucide-react"

interface Campaign {
  id: string
  name: string
  status: "draft" | "scheduled" | "sending" | "sent" | "failed" | "paused"
  target_audience_count: number
  sent_count: number
  delivered_count: number
  read_count: number
  replied_count: number
  clicked_count: number
  conversion_count: number
  revenue_attributed: number
  scheduled_at: string | null
  sent_at: string | null
  created_by: string
}

const STATUS_CONFIG: Record<string, { label: string; variant: "neutral" | "blue" | "amber" | "green" | "red" | "yellow" }> = {
  draft: { label: "Draft", variant: "neutral" },
  scheduled: { label: "Scheduled", variant: "blue" },
  sending: { label: "Sending", variant: "amber" },
  sent: { label: "Completed", variant: "green" },
  failed: { label: "Failed", variant: "red" },
  paused: { label: "Paused", variant: "yellow" },
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/campaigns")
      .then(r => r.json())
      .then(data => setCampaigns(data.campaigns || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0)
  const totalDelivered = campaigns.reduce((s, c) => s + c.delivered_count, 0)
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue_attributed, 0)
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : "—"

  const columns: Column<Campaign>[] = [
    {
      key: "name",
      header: "Campaign",
      sortable: true,
      render: (c) => (
        <Link href={`/broadcasts/${c.id}`} className="hover:opacity-80 transition-opacity">
          <p className="font-semibold text-sm">{c.name}</p>
          <p className="text-xs text-muted-foreground">Target: {c.target_audience_count.toLocaleString("en-IN")} contacts</p>
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (c) => (
        <Badge variant={STATUS_CONFIG[c.status]?.variant || "neutral"} size="sm" dot>
          {STATUS_CONFIG[c.status]?.label || c.status}
        </Badge>
      ),
    },
    {
      key: "delivery",
      header: "Delivery Rate",
      render: (c) => {
        if (c.status === "draft" || c.status === "scheduled") return <span className="text-muted-foreground text-sm">—</span>
        const rate = (c.delivered_count / (c.sent_count || 1)) * 100
        return (
          <div className="min-w-[80px]">
            <p className="text-sm font-medium">{rate.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">{c.delivered_count.toLocaleString("en-IN")} delivered</p>
          </div>
        )
      },
    },
    {
      key: "revenue",
      header: "Revenue",
      sortable: true,
      render: (c) => (
        <div>
          <p className="text-sm font-medium text-emerald-400">{formatCurrency(c.revenue_attributed)}</p>
          {c.conversion_count > 0 && <p className="text-[10px] text-muted-foreground">{c.conversion_count} sales</p>}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (c) => (
        <span className="text-xs text-muted-foreground">
          {c.sent_at ? formatDateTime(c.sent_at) : c.scheduled_at ? `Sch: ${formatDateTime(c.scheduled_at)}` : "Draft"}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Broadcasts"
        description="WhatsApp broadcast marketing campaigns"
        actions={
          <Link href="/broadcasts/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              New Broadcast
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Sent", value: totalSent.toLocaleString("en-IN"), icon: Send },
          { label: "Delivery Rate (Avg)", value: typeof deliveryRate === "string" ? deliveryRate : `${deliveryRate}%`, icon: CheckCircle2 },
          { label: "Total Campaigns", value: String(campaigns.length), icon: BarChart3 },
          { label: "Campaign Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-5 w-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">No campaigns yet</p>
          <Link href="/broadcasts/new">
            <Button>Create your first broadcast</Button>
          </Link>
        </div>
      ) : (
        <DataTable data={campaigns} columns={columns} getId={(c) => c.id} />
      )}
    </div>
  )
}
