import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/types/supabase"

const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project-id.supabase.co"

export function isDemoMode() {
  return DEMO_MODE
}

function getDemoUser() {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("gc_demo_user")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function getDemoProfile() {
  return getDemoUser() || {
    id: "demo-user-id",
    email: "admin@grandhotel.com",
    full_name: "Admin User",
    role: "admin",
    avatar_url: null,
    phone: "+1 (555) 123-4567",
    business_id: null,
    is_active: true,
    last_sign_in_at: new Date().toISOString(),
    created_at: "2025-01-15T08:00:00Z",
    updated_at: new Date().toISOString(),
  }
}

export function setDemoUser(profile: Record<string, unknown>) {
  localStorage.setItem("gc_demo_user", JSON.stringify(profile))
}

export function clearDemoUser() {
  localStorage.removeItem("gc_demo_user")
}

export function createClient() {
  if (DEMO_MODE) {
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>
  }
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
