"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { APP_NAME } from "@/lib/utils/constants"
import { MAIN_NAV_ITEMS } from "@/lib/constants/menu"
import { clearDemoUser } from "@/lib/supabase/client"
import { useAuthContext } from "@/providers/AuthProvider"
import { initials } from "@/lib/utils/format"
import { ChevronLeft, LogOut } from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname() || ''
  const router = useRouter()
  const { profile, signOut } = useAuthContext()

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await signOut()
    clearDemoUser()
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;max-age=0;path=/")
    })
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <span className="text-sm font-bold text-accent-foreground">GC</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            "rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors",
            collapsed && "hidden",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="h-8 w-8 shrink-0 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-accent">
              {profile ? initials(profile.full_name) : "?"}
            </span>
          </div>
          {!collapsed && profile && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleSignOut} className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary transition-colors" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
