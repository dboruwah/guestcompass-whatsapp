"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils/cn"
import { Badge } from "@/components/ui/Badge"
import { Plus, X } from "lucide-react"

interface Tag {
  id: string
  name: string
  color: string
}

interface TagPickerProps {
  tags: Tag[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function TagPicker({ tags, selected, onChange, placeholder = "Select tags...", className }: TagPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  )

  const toggleTag = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  const removeTag = (id: string) => {
    onChange(selected.filter((s) => s !== id))
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-1.5 rounded-lg border border-input bg-secondary/50 cursor-text" onClick={() => setOpen(!open)}>
        {selected.map((id) => {
          const tag = tags.find((t) => t.id === id)
          if (!tag) return null
          return (
            <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: tag.color + "20", color: tag.color }}>
              {tag.name}
              <button onClick={(e) => { e.stopPropagation(); removeTag(id) }} className="hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          )
        })}
        {selected.length === 0 && (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-secondary/50 py-1.5 px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary/50 transition-colors",
                  selected.includes(tag.id) && "bg-accent/10",
                )}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />
                <span>{tag.name}</span>
                {selected.includes(tag.id) && <span className="ml-auto text-xs text-accent">✓</span>}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">No tags found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function TagList({ tags, max = 3 }: { tags: Tag[]; max?: number }) {
  const visible = tags.slice(0, max)
  const remaining = tags.length - max

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
          style={{ backgroundColor: tag.color + "20", color: tag.color }}
        >
          {tag.name}
        </span>
      ))}
      {remaining > 0 && (
        <Badge variant="neutral" size="sm">+{remaining}</Badge>
      )}
    </div>
  )
}
