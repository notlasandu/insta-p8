import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, pageAccessToken } = body

    if (!pageId || !pageAccessToken) {
      return NextResponse.json({ error: "Missing page info" }, { status: 400 })
    }

    // Get the user ID from the session cookie
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("insta_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const session = JSON.parse(sessionCookie.value)
    const fbUserId = session.userId

    if (!fbUserId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if an Instagram Business Account is linked to this Facebook Page
    let igBusinessAccountId = null
    try {
      const igRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`)
      const igData = await igRes.json()
      
      if (!igRes.ok) {
        console.error("[fb-oauth] Failed to fetch linked IG account response:", igData)
      } else if (igData.instagram_business_account?.id) {
        igBusinessAccountId = igData.instagram_business_account.id
        console.log(`[fb-oauth] 🎯 Found linked IG Account: ${igBusinessAccountId}`)
      } else {
        console.log(`[fb-oauth] ⚠️ No IG Account linked to Facebook Page ${pageId}`)
      }
    } catch (e) {
      console.error("[fb-oauth] Failed to fetch linked IG account", e)
    }

    // Update User in Supabase with the selected page
    const supabase = await getSupabaseServerClient()

    const updates: any = {
      access_token: pageAccessToken, // The Master Token!
      token_expires_at: null, // Page access tokens generated this way are usually long-lived/non-expiring
      updated_at: new Date().toISOString(),
      page_id: pageId,
      business_account_id: igBusinessAccountId || null,
    }

    console.log(`[fb-oauth] 💾 Updating FB User: fb_id=${fbUserId} | page_id=${pageId} | ig_biz_id=${igBusinessAccountId}`)

    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", fbUserId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("[fb-oauth] save-page error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
