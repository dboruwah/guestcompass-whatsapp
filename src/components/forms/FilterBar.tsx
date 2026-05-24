"use client"

import { useState } from "react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Filter, X, Plus, Calendar, ChevronDown } from "lucide-react"

interface FilterField {
  key: string
  label: string
  type: "text" | "select" | "date" | "number" | "multiselect"
  options?: { label: string; value: string }[]
}

interface FilterRule {
  id: string
  field: string
  operator: string
  value: string
}

interface FilterBarProps {
  fields: FilterField[]
  onFilter: (rules: FilterRule[]) => void
  onClear: () => void
  ruleCount?: number
}

const OPERATORS = [
  { label: "Contains", value: "contains" },
  { label: "Equals", value: "equals" },
  { label: "Not equals", value: "not_equals" },
  { label: "Starts with", value: "starts_with" },
  { label: "Greater than", value: "gt" },
  { label: "Less than", value: "lt" },
  { label: "Between", value: "between" },
  { label: "Is empty", value: "empty" },
  { label: "Is not empty", value: "not_empty" },
]

export function FilterBar({ fields, onFilter, onClear, ruleCount = 0 }: FilterBarProps) {
  const [open, setOpen] = useState(false)
  const [rules, setRules] = useState<FilterRule[]>([])

  const addRule = () => {
    setRules([...rules, { id: crypto.randomUUID(), field: fields[0]?.key || "", operator: "contains", value: "" }])
  }

  const removeRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id)
    setRules(updated)
    onFilter(updated)
  }

  const updateRule = (id: string, key: keyof FilterRule, value: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
  }

  const applyFilters = () => {
    onFilter(rules.filter((r) => r.value))
    setOpen(false)
  }

  const clearAll = () => {
    setRules([])
    onClear()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
          open || ruleCount > 0
            ? "border-accent/50 bg-accent/10 text-accent"
            : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
        )}
      >
        <Filter className="h-4 w-4" />
        Filters
        {ruleCount > 0 && (
          <Badge variant="blue" size="sm">{ruleCount}</Badge>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div
            className="absolute top-16 left-4 right-4 lg:left-auto lg:right-4 lg:w-[480px] rounded-xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-sm font-semibold">Filter contacts</h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {rules.map((rule) => {
                const field = fields.find((f) => f.key === rule.field)
                return (
                  <div key={rule.id} className="flex items-start gap-2 p-3 rounded-lg border border-border bg-secondary/30">
                    <div className="flex-1 space-y-2">
                      <Select
                        value={rule.field}
                        onChange={(e) => updateRule(rule.id, "field", e.target.value)}
                        options={fields.map((f) => ({ label: f.label, value: f.key }))}
                        placeholder="Select field"
                      />
                      <div className="flex gap-2">
                        <Select
                          value={rule.operator}
                          onChange={(e) => updateRule(rule.id, "operator", e.target.value)}
                          options={OPERATORS}
                          placeholder="Operator"
                          className="flex-1"
                        />
                        {field?.type !== "select" && (
                          <Input
                            value={rule.value}
                            onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                            placeholder="Value"
                            className="flex-1"
                          />
                        )}
                      </div>
                    </div>
                    <button onClick={() => removeRule(rule.id)} className="mt-2 rounded-lg p-1 text-muted-foreground hover:text-red-400 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}

              <button
                onClick={addRule}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add condition
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-border p-4">
              <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={applyFilters}>Apply filters</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
