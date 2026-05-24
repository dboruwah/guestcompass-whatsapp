"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils/cn"
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Check } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => ReactNode
  width?: string
  align?: "left" | "center" | "right"
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  getId: (item: T) => string
  selected?: string[]
  onSelectionChange?: (ids: string[]) => void
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (key: string, order: "asc" | "desc") => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange?: (size: number) => void
  }
  emptyState?: ReactNode
  loading?: boolean
}

export function DataTable<T>({
  data,
  columns,
  getId,
  selected = [],
  onSelectionChange,
  sortBy,
  sortOrder = "asc",
  onSort,
  pagination,
  emptyState,
  loading,
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const allSelected = data.length > 0 && selected.length === data.length
  const someSelected = selected.length > 0 && selected.length < data.length

  const toggleAll = () => {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? [] : data.map(getId))
  }

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return
    onSelectionChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  const handleSort = (key: string) => {
    if (!onSort) return
    if (sortBy === key) {
      onSort(key, sortOrder === "asc" ? "desc" : "asc")
    } else {
      onSort(key, "asc")
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <div className="p-12 text-center">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-secondary/40 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        {emptyState || (
          <div className="p-12 text-center text-sm text-muted-foreground">No data available</div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {onSelectionChange && (
                <th className="w-12 px-4 py-3">
                  <button onClick={toggleAll} className="flex items-center justify-center">
                    <div className={cn(
                      "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors",
                      allSelected ? "bg-accent border-accent" : someSelected ? "border-accent bg-accent/20" : "border-border",
                    )}>
                      {allSelected && <Check className="h-3 w-3 text-accent-foreground" />}
                      {someSelected && !allSelected && <div className="h-2 w-2 rounded-sm bg-accent" />}
                    </div>
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={cn("flex items-center gap-1", col.align === "right" && "justify-end", col.align === "center" && "justify-center")}>
                    {col.header}
                    {col.sortable && (
                      sortBy === col.key ? (
                        sortOrder === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const id = getId(item)
              const isSelected = selected.includes(id)
              return (
                <tr
                  key={id}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    isSelected && "bg-accent/5",
                    hoveredRow === id && !isSelected && "bg-secondary/30",
                  )}
                  onMouseEnter={() => setHoveredRow(id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {onSelectionChange && (
                    <td className="px-4 py-3">
                      <button onClick={() => toggleRow(id)} className="flex items-center justify-center">
                        <div className={cn(
                          "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected ? "bg-accent border-accent" : "border-border hover:border-accent/50",
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-accent-foreground" />}
                        </div>
                      </button>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                      )}
                    >
                      {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </span>
            {pagination.onPageSizeChange && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                className="rounded-md border border-input bg-secondary/50 py-1 px-2 text-xs focus:outline-none"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size} per page</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }).map((_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={cn(
                    "rounded-lg w-8 h-8 text-sm font-medium transition-colors",
                    pagination.page === page ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {page}
                </button>
              )
            })}
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
