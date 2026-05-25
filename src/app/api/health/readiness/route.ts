import { NextResponse } from "next/server"

export async function GET() {
  const checks: Record<string, string> = {}

  // Check Supabase connectivity
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (url) {
      const resp = await fetch(`${url}/rest/v1/`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "" },
      })
      checks.supabase = resp.ok ? "ok" : `error (${resp.status})`
    } else {
      checks.supabase = "not configured"
    }
  } catch {
    checks.supabase = "unreachable"
  }

  // Check Redis connectivity (optional)
  checks.redis = process.env.REDIS_URL ? "configured" : "not configured"

  const allOk = Object.values(checks).every((v) => v === "ok" || v === "configured" || v === "not configured")

  return NextResponse.json(
    { status: allOk ? "ready" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 },
  )
}
