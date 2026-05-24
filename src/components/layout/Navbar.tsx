"use client"

import { useState } from "react"
import { Menu, Bell, Search } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [notifications] = useState(3)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search guests, campaigns, messages..."
          className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {notifications}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
