"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui"
import { formatPhoneNumber, initials, formatCurrency } from "@/lib/utils/format"
import { formatDateTime, formatRelativeDate } from "@/lib/utils/date"
import { Phone, Mail, Calendar, Globe, Link2, Loader2, ArrowLeft } from "lucide-react"

export default function ContactProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) return
    fetch(`/api/contacts/${params.id}`)
      .then(r => r.json())
      .then(setContact)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params?.id])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  if (!contact) {
    return (
      <div className="space-y-6 animate-in">
        <PageHeader title="Contact not found" actions={<Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={`${contact.first_name || ""} ${contact.last_name || ""}`}
        description={`Contact profile`}
        actions={
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Messages Received", value: contact.total_messages_received || 0 },
              { label: "Replies", value: contact.total_messages_sent || 0 },
              { label: "Conversions", value: contact.conversion_count || 0 },
              { label: "Lifetime Value", value: formatCurrency(contact.lifetime_value || 0) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <p className="text-xl font-semibold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {contact.activity && contact.activity.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {contact.activity.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{a.description || a.action}</span>
                    <span className="text-xs text-muted-foreground">{formatRelativeDate(a.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-accent">{initials(`${contact.first_name || ""} ${contact.last_name || ""}`)}</span>
              </div>
              <div>
                <h3 className="text-base font-semibold">{contact.first_name} {contact.last_name}</h3>
                <span className={`text-xs font-medium ${contact.opt_in_status === "opted_in" ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {contact.opt_in_status?.replace("_", " ") || "unknown"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {contact.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{formatPhoneNumber(contact.phone)}</span></div>}
              {contact.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{contact.email}</span></div>}
              {contact.language && <div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-muted-foreground" /><span>{contact.language}</span></div>}
              {contact.opt_in_source && <div className="flex items-center gap-2 text-sm"><Link2 className="h-4 w-4 text-muted-foreground" /><span>Source: {contact.opt_in_source}</span></div>}
              <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>Added {formatRelativeDate(contact.created_at)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
