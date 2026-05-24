"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui"
import { formatCurrency } from "@/lib/utils/format"
import { formatDateTime } from "@/lib/utils/date"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    fetch(`/api/campaigns/${params.id}`)
      .then(r => r.json())
      .then(setCampaign)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="space-y-6 animate-in">
        <PageHeader title="Campaign not found" actions={<Button variant="ghost" onClick={() => router.push("/broadcasts")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>} />
      </div>
    )
  }

  const deliveryRate = campaign.sent_count > 0 ? (campaign.delivered_count / campaign.sent_count * 100).toFixed(1) : "0"
  const readRate = campaign.delivered_count > 0 ? (campaign.read_count / campaign.delivered_count * 100).toFixed(1) : "0"
  const replyRate = campaign.delivered_count > 0 ? (campaign.replied_count / campaign.delivered_count * 100).toFixed(1) : "0"
  const conversionRate = campaign.delivered_count > 0 ? (campaign.conversion_count / campaign.delivered_count * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={campaign.name}
        description={`Broadcast campaign · Status: ${campaign.status}`}
        actions={
          <Button variant="ghost" onClick={() => router.push("/broadcasts")}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Target", value: campaign.target_audience_count?.toLocaleString("en-IN") || "0", color: "text-foreground" },
          { label: "Delivered", value: campaign.delivered_count?.toLocaleString("en-IN") || "0", percent: `${deliveryRate}%`, color: "text-emerald-400" },
          { label: "Read Rate", value: campaign.read_count?.toLocaleString("en-IN") || "0", percent: `${readRate}%`, color: "text-accent" },
          { label: "Replies", value: campaign.replied_count?.toLocaleString("en-IN") || "0", percent: `${replyRate}%`, color: "text-blue-400" },
          { label: "Conversions", value: campaign.conversion_count?.toLocaleString("en-IN") || "0", percent: `${conversionRate}%`, color: "text-purple-400" },
        ].map((funnelStep) => (
          <div key={funnelStep.label} className="rounded-xl border border-border bg-card p-5">
            <span className="text-xs text-muted-foreground">{funnelStep.label}</span>
            <p className="text-2xl font-bold mt-1">{funnelStep.value}</p>
            {funnelStep.percent && <span className={`text-xs font-semibold mt-1 block ${funnelStep.color}`}>{funnelStep.percent}</span>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3">Campaign Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{campaign.status}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{campaign.type || "broadcast"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Scheduled</span><span className="font-medium">{campaign.scheduled_at ? formatDateTime(campaign.scheduled_at) : "Immediate"}</span></div>
            {campaign.sent_at && <div className="flex justify-between"><span className="text-muted-foreground">Sent</span><span className="font-medium">{formatDateTime(campaign.sent_at)}</span></div>}
            {campaign.completed_at && <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-medium">{formatDateTime(campaign.completed_at)}</span></div>}
            {campaign.description && <div className="pt-2"><span className="text-muted-foreground">Description</span><p className="mt-1">{campaign.description}</p></div>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold mb-1 text-muted-foreground">Attributed Revenue</h3>
            <p className="text-4xl font-bold mt-2 text-emerald-400">{formatCurrency(campaign.revenue_attributed || 0)}</p>
            <p className="text-xs text-muted-foreground mt-2">Conversions: <strong>{campaign.conversion_count || 0}</strong></p>
          </div>
          <div className="border-t border-border pt-4 mt-4">
            <span className="text-xs text-muted-foreground">Created</span>
            <p className="text-sm font-semibold mt-1">{campaign.created_at ? formatDateTime(campaign.created_at) : "—"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
