import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()

  const response = NextResponse.json({ ok: true })

  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").match(/https?:\/\/([^.]+)/)?.[1] || ""
  if (projectRef) {
    response.cookies.set(`sb-${projectRef}-auth-token`, "", {
      maxAge: 0, path: "/", httpOnly: true, secure: true, sameSite: "lax",
    })
  }

  response.cookies.set("supabase-auth-token", "", { maxAge: 0, path: "/" })
  response.cookies.set("sb-auth-token", "", { maxAge: 0, path: "/" })
  response.cookies.set("sb-session", "", { maxAge: 0, path: "/" })

  return response
}
