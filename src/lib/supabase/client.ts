import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/types/supabase"

export function isDemoMode() {
  return false
}

export function getDemoProfile() {
  return null
}

export function setDemoUser() {}

export function clearDemoUser() {}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
