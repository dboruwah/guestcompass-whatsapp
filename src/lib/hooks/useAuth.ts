"use client"

import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { useEffect, useState } from "react"

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      setProfile(data as unknown as Profile)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
        setProfile(data as unknown as Profile)
      } else if (event === "SIGNED_OUT") {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { profile, loading, isAuthenticated: !!profile }
}
