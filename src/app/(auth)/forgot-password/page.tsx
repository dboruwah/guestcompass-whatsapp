"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    })

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a password reset link to <strong className="text-foreground">{email}</strong>
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Reset your password</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleReset} className="space-y-5">
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

        <Button type="submit" loading={loading} className="w-full">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </p>
    </div>
  )
}
