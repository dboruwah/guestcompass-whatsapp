"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient, isDemoMode, setDemoUser, getDemoProfile } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const demo = isDemoMode()
  const [email, setEmail] = useState(demo ? "admin@grandhotel.com" : "")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("gc_demo_user")
    if (stored) {
      router.push("/dashboard")
    }
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (demo) {
      setDemoUser(getDemoProfile())
      router.push("/dashboard")
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  async function handleDemoLogin() {
    setLoading(true)
    setDemoUser(getDemoProfile())
    router.push("/dashboard")
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Welcome back</h1>
      <p className="text-sm text-muted-foreground mb-8">Sign in to your account to continue</p>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder="you@hotel.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-sm text-accent hover:text-accent/80 transition-colors">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs text-muted-foreground">
            <span className="bg-background px-2">Quick access</span>
          </div>
        </div>
        <Button onClick={handleDemoLogin} loading={loading} variant="outline" className="w-full gap-2">
          <Sparkles className="h-4 w-4" />
          Continue with Demo Account
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:text-accent/80 transition-colors font-medium">
          Create one
        </Link>
      </p>
    </div>
  )
}
