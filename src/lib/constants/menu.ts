import {
  LayoutDashboard,
  Users,
  Send,
  UserCheck,
  MessageSquare,
  BarChart3,
  Settings,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react"

export interface MainNavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: keyof React.ReactNode
}

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Broadcasts", href: "/broadcasts", icon: Send },
  { label: "Segments", href: "/segments", icon: UserCheck },
  { label: "Inbox", href: "/inbox", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Audit Logs", href: "/audit-logs", icon: ShieldAlert },
]

export const MOBILE_NAV_ITEMS: MainNavItem[] = MAIN_NAV_ITEMS
