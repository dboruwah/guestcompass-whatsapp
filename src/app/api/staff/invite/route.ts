import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabaseAdmin: any = (await import("@/lib/supabase/admin")).createAdminClient()

    const { data: requester } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!requester || requester.role === "viewer" || requester.role === "agent") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { email, full_name, role, business_id } = await request.json()

    if (!email || !full_name) {
      return NextResponse.json({ error: "Email and full_name are required" }, { status: 400 })
    }

    const validRoles = ["admin", "manager", "agent", "viewer"]
    const assignRole = validRoles.includes(role) ? role : "agent"

    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role: assignRole },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    })

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 })
    }

    if (business_id) {
      const { error: staffErr } = await supabaseAdmin.from("staff").insert({
        user_id: newUser!.user.id,
        business_id,
        role: assignRole,
        status: "active",
        position: null,
        department: null,
        permissions: [],
      })
      if (staffErr) {
        console.warn("Failed to create staff record:", staffErr.message)
      }
    }

    return NextResponse.json({
      ok: true,
      user: { id: newUser!.user.id, email, full_name, role: assignRole },
      message: `Invitation sent to ${email}`,
    })
  } catch (err) {
    console.error("Invite error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
