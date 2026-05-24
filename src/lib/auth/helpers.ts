import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return data as unknown as Profile
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
