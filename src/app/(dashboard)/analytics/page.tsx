"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { BarChart3, TrendingUp, Users, Send, MessageSquare, DollarSign, Loader2 } from "lucide-react"

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const stats = data || { total_messages: 0, delivery_rate: 0, read_rate: 0, active_contacts: 0, total_campaigns: 0, total_revenue: 0, revenue_formatted: "₹0.00" }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader title="Analytics" description="Campaign performance and audience insights" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: "Total Messages", value: stats.total_messages.toLocaleString("en-IN"), icon: MessageSquare },
          { label: "Delivery Rate", value: `${stats.delivery_rate}%`, icon: TrendingUp },
          { label: "Read Rate", value: `${stats.read_rate}%`, icon: BarChart3 },
          { label: "Campaigns", value: stats.total_campaigns, icon: Send },
          { label: "Revenue", value: stats.revenue_formatted, icon: DollarSign },
          { label: "Active Contacts", value: stats.active_contacts.toLocaleString("en-IN"), icon: Users },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-1">Campaign Performance</h3>
          <p className="text-sm text-muted-foreground">Delivery, open, and response metrics</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-1">Audience Growth</h3>
          <p className="text-sm text-muted-foreground">{stats.active_contacts.toLocaleString("en-IN")} opted-in contacts</p>
        </div>
      </div>
    </div>
  )
}
