"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Loader2, Save, Check } from "lucide-react"

interface Business {
  id: string
  name: string
  slug: string
  timezone: string
  default_language: string
  whatsapp_business_phone: string | null
  settings: Record<string, unknown>
  is_active: boolean
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [form, setForm] = useState({ name: "", timezone: "", default_language: "", whatsapp_business_phone: "" })
  const [templateCount, setTemplateCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => {
        if (d.business) {
          setBusiness(d.business)
          setForm({
            name: d.business.name || "",
            timezone: d.business.timezone || "UTC",
            default_language: d.business.default_language || "en",
            whatsapp_business_phone: d.business.whatsapp_business_phone || "",
          })
        }
        setTemplateCount(d.templates_count || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        setBusiness(data)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {}
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Settings"
        description="Configure your property and platform preferences"
        actions={
          <Button onClick={handleSave} loading={saving}>
            {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saved ? "Saved" : "Save Changes"}
          </Button>
        }
      />

      <div className="space-y-6">
        {business && (
          <>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold">Property Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Business Name</label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Timezone</label>
                  <select
                    className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    value={form.timezone}
                    onChange={e => setForm({ ...form, timezone: e.target.value })}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST, +05:30)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST, +04:00)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Default Language</label>
                  <select
                    className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    value={form.default_language}
                    onChange={e => setForm({ ...form, default_language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                    <option value="gu">Gujarati</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="kn">Kannada</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">WhatsApp Business Phone</label>
                  <Input
                    value={form.whatsapp_business_phone}
                    onChange={e => setForm({ ...form, whatsapp_business_phone: e.target.value })}
                    placeholder="+919XXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold mb-1">WhatsApp Integration</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {form.whatsapp_business_phone
                  ? `Phone: ${form.whatsapp_business_phone}`
                  : "WhatsApp Business API not configured."}
                <br />
                {templateCount > 0 ? `${templateCount} templates available` : "No templates yet."}
              </p>
            </div>
          </>
        )}

        {!business && (
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">No business configured. Contact an administrator.</p>
          </div>
        )}

        {["messaging", "notifications", "security", "billing"].map(s => (
          <div key={s} className="rounded-xl border border-border bg-card p-6 opacity-60">
            <h3 className="text-sm font-semibold mb-1 capitalize">{s} Preferences</h3>
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          </div>
        ))}
      </div>
    </div>
  )
}
