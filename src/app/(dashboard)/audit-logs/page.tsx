"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Search, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchLogs = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    fetch(`/api/audit-logs?${params}`)
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [])

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Audit Logs"
        description="Track all system activities and changes"
        actions={
          <Button variant="outline" onClick={() => {}}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      <div className="flex gap-4 items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); fetchLogs() }}
            placeholder="Search audit logs..."
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No audit logs yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{log.action?.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{log.entity_type} · {log.profiles?.full_name || log.actor_id?.slice(0, 8)}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-4">
                  {new Date(log.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
