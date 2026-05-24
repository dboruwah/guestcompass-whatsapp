"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/Button"
import { Plus, Loader2 } from "lucide-react"

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/staff")
      .then(r => r.json())
      .then(data => setStaff(data.staff || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeStaff = staff.filter((s: any) => s.status === "active")

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Team"
        description={`${activeStaff.length} active team members`}
        actions={
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Members", value: activeStaff.length },
          { label: "Total Members", value: staff.length },
          { label: "Roles", value: [...new Set(staff.map((s: any) => s.role))].join(", ") || "—" },
          { label: "Conversations Handled", value: staff.reduce((s: number, m: any) => s + (m.conversations_handled || 0), 0).toLocaleString("en-IN") },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : staff.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No team members yet. Invite members to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {staff.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-accent">
                      {(member.profiles?.full_name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.profiles?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{member.profiles?.email || member.position || member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-xs capitalize bg-secondary px-2 py-1 rounded">{member.role}</span>
                  <span className={`text-xs ${member.status === "active" ? "text-emerald-400" : "text-muted-foreground"}`}>{member.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
