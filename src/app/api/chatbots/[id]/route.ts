import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

let ADMIN: any = null
try { ADMIN = createAdminClient() } catch {}

async function getBusinessId(supabase: any, userId: string): Promise<string | null> {
  const { data: profile } = await (supabase as any).from("profiles").select("business_id").eq("id", userId).maybeSingle()
  if (profile?.business_id) return profile.business_id

  if (ADMIN) {
    const { data: staff } = await ADMIN.from("staff").select("business_id").eq("user_id", userId).maybeSingle()
    if (staff?.business_id) return staff.business_id
  }

  return null
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const businessId = await getBusinessId(supabase, user.id)
  if (!businessId) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const { data, error } = await (supabase as any)
    .from("chatbots")
    .select("*, rules:chatbot_rules(*)")
    .eq("id", id)
    .eq("business_id", businessId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const businessId = await getBusinessId(supabase, user.id)
  if (!businessId) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const body = await request.json()
  const { data, error } = await (supabase as any)
    .from("chatbots")
    .update(body)
    .eq("id", id)
    .eq("business_id", businessId)
    .select("*, rules:chatbot_rules(*)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const businessId = await getBusinessId(supabase, user.id)
  if (!businessId) return NextResponse.json({ error: "No business found" }, { status: 404 })

  const { error } = await (supabase as any).from("chatbots").delete().eq("id", id).eq("business_id", businessId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
