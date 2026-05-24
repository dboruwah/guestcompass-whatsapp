"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Save, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [business, setBusiness] = useState<any>(null)
  const [templateCount, setTemplateCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { setBusiness(d.business); setTemplateCount(d.templates_count || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Settings"
        description="Configure your property and platform preferences"
        actions={<Button><Save className="h-4 w-4" />Save Changes</Button>}
      />

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-1">Property Information</h3>
          {business ? (
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {business.name}</p>
              <p><span className="text-muted-foreground">Timezone:</span> {business.timezone}</p>
              <p><span className="text-muted-foreground">Language:</span> {business.default_language}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No business configured.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-1">WhatsApp Integration</h3>
          <p className="text-sm text-muted-foreground mt-2">
            {business?.whatsapp_business_phone
              ? `Phone: ${business.whatsapp_business_phone}`
              : "WhatsApp Business API not configured."}
            <br />
            {templateCount > 0 ? `${templateCount} templates available` : "No templates yet."}
          </p>
        </div>

        {[
          { title: "Messaging Preferences", desc: "Auto-reply settings, business hours, quiet hours." },
          { title: "Notification Preferences", desc: "Email/SMS alerts for conversations and campaign events." },
          { title: "Security", desc: "Session management, IP whitelisting, and API keys." },
          { title: "Billing", desc: "Subscription plan, usage limits, invoices, and payment methods." },
        ].map(s => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
