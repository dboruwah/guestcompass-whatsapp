"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient, isDemoMode, getDemoProfile, clearDemoUser } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"

interface AuthContextValue {
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  profile: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demo = isDemoMode()

    if (demo) {
      const stored = localStorage.getItem("gc_demo_user")
      if (stored) {
        setProfile(getDemoProfile() as Profile)
      }
      setLoading(false)
      return
    }

    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
        setProfile(data as unknown as Profile)
      } catch {
        // Profile may not exist or RLS blocks access — user is still authenticated
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle()
          setProfile(data as unknown as Profile)
        } catch {
          // Profile fetch failed — user is still authenticated
        }
      } else if (event === "SIGNED_OUT") {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const demo = isDemoMode()
    if (demo) {
      clearDemoUser()
      setProfile(null)
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ profile, loading, isAuthenticated: !!profile, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
