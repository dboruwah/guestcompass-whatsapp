import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await (supabase as any).from("profiles").select("business_id").eq("id", user.id).single()
  if (!profile?.business_id) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const { data, error } = await (supabase as any)
    .from("chatbots")
    .select("*, rules:chatbot_rules(*)")
    .eq("business_id", profile.business_id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await (supabase as any).from("profiles").select("business_id").eq("id", user.id).single()
  if (!profile?.business_id) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const body = await request.json()
  const { data, error } = await (supabase as any)
    .from("chatbots")
    .insert({ business_id: profile.business_id, ...body, created_by: user.id })
    .select("*, rules:chatbot_rules(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
