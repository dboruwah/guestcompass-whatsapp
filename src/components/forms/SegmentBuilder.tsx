"use client"

import { useState } from "react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Plus, X, ArrowRight, Save, Eye } from "lucide-react"

interface SegmentRule {
  id: string
  field: string
  operator: string
  value: string
}

interface SegmentBuilderProps {
  onSave?: (name: string, description: string, logic: "and" | "or", rules: SegmentRule[]) => void
  onPreview?: (rules: SegmentRule[]) => void
  existingTags?: { id: string; name: string }[]
}

const FIELDS = [
  { label: "Tags", value: "tags", type: "multiselect" },
  { label: "Opt-in Status", value: "opt_in_status", type: "select" },
  { label: "Engagement Score", value: "engagement_score", type: "number" },
  { label: "Total Messages Received", value: "total_messages_received", type: "number" },
  { label: "Total Replies", value: "total_messages_sent", type: "number" },
  { label: "Last Interaction", value: "last_message_at", type: "date" },
  { label: "Revenue Attributed", value: "lifetime_value", type: "number" },
  { label: "Campaign Participation", value: "campaign_count", type: "number" },
  { label: "Conversion Count", value: "conversion_count", type: "number" },
  { label: "Assigned Staff", value: "assigned_to", type: "select" },
  { label: "Source", value: "opt_in_source", type: "text" },
  { label: "Language", value: "language", type: "select" },
]

const OPERATORS = [
  { label: "Contains", value: "contains" },
  { label: "Equals", value: "equals" },
  { label: "Not equals", value: "not_equals" },
  { label: "Greater than", value: "gt" },
  { label: "Less than", value: "lt" },
  { label: "Between", value: "between" },
  { label: "Is empty", value: "empty" },
  { label: "Is not empty", value: "not_empty" },
]

const OPT_IN_OPTIONS = [
  { label: "Opted In", value: "opted_in" },
  { label: "Pending", value: "pending" },
  { label: "Opted Out", value: "opted_out" },
]

export function SegmentBuilder({ onSave, onPreview, existingTags = [] }: SegmentBuilderProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [logic, setLogic] = useState<"and" | "or">("and")
  const [rules, setRules] = useState<SegmentRule[]>([])
  const [previewCount, setPreviewCount] = useState<number | null>(null)

  const addRule = () => {
    setRules([...rules, { id: crypto.randomUUID(), field: "tags", operator: "contains", value: "" }])
  }

  const removeRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id))
  }

  const updateRule = (id: string, key: keyof SegmentRule, value: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
  }

  const handlePreview = () => {
    onPreview?.(rules)
    setPreviewCount(Math.floor(Math.random() * 5000) + 500)
  }

  const handleSave = () => {
    if (!name || rules.length === 0) return
    onSave?.(name, description, logic, rules)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Segment Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Highly Engaged VIP Customers" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this segment's purpose" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Match Logic</label>
          <div className="flex gap-2">
            <button
              onClick={() => setLogic("and")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                logic === "and" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              Match ALL conditions
            </button>
            <button
              onClick={() => setLogic("or")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                logic === "or" ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              Match ANY condition
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Conditions</h4>
          <Button variant="ghost" size="sm" onClick={addRule}>
            <Plus className="h-4 w-4 mr-1" />
            Add condition
          </Button>
        </div>

        {rules.map((rule, i) => {
          const field = FIELDS.find((f) => f.value === rule.field)
          return (
            <div key={rule.id} className="flex items-start gap-2">
              <div className="flex items-center justify-center w-8 pt-2">
                {i === 0 ? (
                  <span className="text-xs font-medium text-muted-foreground">Where</span>
                ) : (
                  <Badge variant={logic === "and" ? "blue" : "amber"} size="sm">{logic === "and" ? "AND" : "OR"}</Badge>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <Select
                  value={rule.field}
                  onChange={(e) => updateRule(rule.id, "field", e.target.value)}
                  options={FIELDS.map((f) => ({ label: f.label, value: f.value }))}
                  className="w-48"
                />
                <Select
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, "operator", e.target.value)}
                  options={OPERATORS}
                  className="w-36"
                />
                {field?.type !== "multiselect" && (
                  field?.value === "opt_in_status" ? (
                    <Select
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                      options={OPT_IN_OPTIONS}
                      placeholder="Select status"
                      className="flex-1"
                    />
                  ) : (
                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                  )
                )}
              </div>
              <button onClick={() => removeRule(rule.id)} className="mt-1.5 rounded-lg p-1 text-muted-foreground hover:text-red-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}

        {rules.length === 0 && (
          <div className="text-center py-8 border border-dashed border-border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">No conditions added</p>
            <Button variant="ghost" size="sm" onClick={addRule}>
              <Plus className="h-4 w-4 mr-1" />
              Add your first condition
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePreview} disabled={rules.length === 0}>
            <Eye className="h-4 w-4 mr-1" />
            Preview audience
          </Button>
          {previewCount !== null && (
            <span className="text-sm text-muted-foreground">
              ~<strong className="text-foreground">{previewCount.toLocaleString()}</strong> contacts match
            </span>
          )}
        </div>
        <Button size="sm" onClick={handleSave} disabled={!name || rules.length === 0}>
          <Save className="h-4 w-4 mr-1" />
          Save segment
        </Button>
      </div>
    </div>
  )
}
