import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, business_account_id, page_id")
      .order("updated_at", { ascending: false })
      .limit(1)

    if (error || !users || users.length === 0) {
      return NextResponse.json({ connected: false, user: null })
    }

    const user = users[0]
    const hasPortfolio = Boolean(user.business_account_id && user.page_id)

    return NextResponse.json({
      connected: hasPortfolio,
      user: {
        id: String(user.id),
        username: user.username,
        business_account_id: user.business_account_id ? String(user.business_account_id) : null,
        page_id: user.page_id,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 })
  }
}
