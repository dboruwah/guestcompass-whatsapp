"use client"

import { cn } from "@/lib/utils/cn"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { StatCardData } from "@/lib/types"

export function StatCard({ label, value, change, icon: Icon, trend }: StatCardData) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-accent/20 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : trend === "down" ? (
                <TrendingDown className="h-4 w-4 text-red-400" />
              ) : null}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === "up" && "text-emerald-400",
                  trend === "down" && "text-red-400",
                  trend === "neutral" && "text-muted-foreground",
                )}
              >
                {change >= 0 ? "+" : ""}{change}%
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Icon className="h-5 w-5 text-accent" />
          </div>
        )}
      </div>
    </div>
  )
}
