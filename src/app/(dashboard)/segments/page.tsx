"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button, Badge, Modal } from "@/components/ui"
import { SegmentBuilder } from "@/components/forms"
import { Plus, Users, TrendingUp, Send, MoreHorizontal, Trash2, Edit3, Eye, Loader2 } from "lucide-react"

interface Segment {
  id: string
  name: string
  description: string | null
  contact_count: number
  is_dynamic: boolean
  created_at: string
}

export default function SegmentsPage() {
  const [showBuilder, setShowBuilder] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/segments")
      .then(r => r.json())
      .then(data => setSegments(data.segments || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalContacts = segments.reduce((a, s) => a + (s.contact_count || 0), 0)

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Segments"
        description={`${segments.length} audience segments defined`}
        actions={
          <Button onClick={() => setShowBuilder(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Segment
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Segments", value: segments.length, icon: Users },
          { label: "Dynamic Segments", value: segments.filter(s => s.is_dynamic).length, icon: TrendingUp },
          { label: "Total Contacts (sum)", value: totalContacts.toLocaleString("en-IN"), icon: Users },
          { label: "Avg Segment Size", value: segments.length > 0 ? Math.round(totalContacts / segments.length).toLocaleString("en-IN") : "0", icon: Send },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-semibold">{typeof stat.value === "number" ? stat.value.toLocaleString("en-IN") : stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : segments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No segments yet. Create your first segment to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map((segment) => (
            <div key={segment.id} className="rounded-xl border border-border bg-card p-5 hover:border-accent/20 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{segment.name}</h3>
                  {segment.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{segment.description}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {segment.is_dynamic && <Badge variant="blue" size="sm" dot>Dynamic</Badge>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-lg font-semibold">{(segment.contact_count || 0).toLocaleString("en-IN")}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Contacts</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(segment.created_at).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showBuilder} onClose={() => setShowBuilder(false)} title="Create Segment" description="Define rules to build your audience segment" size="xl">
        <SegmentBuilder onSave={() => setShowBuilder(false)} onPreview={() => {}} existingTags={[]} />
      </Modal>
    </div>
  )
}
