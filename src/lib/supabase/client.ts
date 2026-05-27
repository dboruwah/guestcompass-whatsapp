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

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Supabase URL and anon key must be set in environment variables")
  }

  _client = createBrowserClient<Database>(url, anonKey)
  return _client
}
