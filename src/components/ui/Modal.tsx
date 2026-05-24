"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils/cn"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: "sm" | "md" | "lg" | "xl"
  footer?: ReactNode
  children: ReactNode
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const

export function Modal({ open, onClose, title, description, size = "md", footer, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200",
          sizes[size],
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-border p-6 pb-4">
            <div>
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border p-4">{footer}</div>
        )}
      </div>
    </div>
  )
}
