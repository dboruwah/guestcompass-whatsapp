import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

async function getBusinessId(supabase: any, userId: string): Promise<string | null> {
  const { data: profile } = await (supabase as any).from("profiles").select("business_id").eq("id", userId).maybeSingle()
  if (profile?.business_id) return profile.business_id

  const { data: staff } = await (supabase as any).from("staff").select("business_id").eq("user_id", userId).maybeSingle()
  return staff?.business_id || null
}

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const businessId = await getBusinessId(supabase, user.id)
  if (!businessId) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const { data, error } = await (supabase as any)
    .from("chatbots")
    .select("*, rules:chatbot_rules(*)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const businessId = await getBusinessId(supabase, user.id)
  if (!businessId) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const body = await request.json()
  const { data, error } = await (supabase as any)
    .from("chatbots")
    .insert({ business_id: businessId, ...body, created_by: user.id })
    .select("*, rules:chatbot_rules(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
