"use client"

import { cn } from "@/lib/utils/cn"
import { AlertTriangle, Info, CheckCircle, X } from "lucide-react"

interface AlertBannerProps {
  variant: "info" | "success" | "warning" | "error"
  message: string
  onDismiss?: () => void
}

const VARIANTS = {
  info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
}

const ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertTriangle,
}

export function AlertBanner({ variant, message, onDismiss }: AlertBannerProps) {
  const Icon = ICONS[variant]

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-4 text-sm", VARIANTS[variant])}>
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
