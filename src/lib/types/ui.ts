import type { LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  children?: NavItem[]
  requiredRole?: string[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface TableColumn<T = Record<string, unknown>> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  align?: "left" | "center" | "right"
  width?: string
}

export interface StatCardData {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
}

export type ToastVariant = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  message: string
  description?: string
  variant: ToastVariant
}

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full"
