import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("error", error)
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("code", code)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.json({ error: "Invalid callback" }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body
    if (!code) return NextResponse.json({ error: "No code" }, { status: 400 })

    // 1. Env Vars
    const clientId = process.env.INSTAGRAM_APP_ID
    const clientSecret = process.env.INSTAGRAM_APP_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Missing Env Vars: Check INSTAGRAM_APP_ID")
    }

    // 2. Exchange Code for User Access Token (Facebook OAuth)
    const tokenUrl = `https://graph.facebook.com/v20.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`
    const tokenRes = await fetch(tokenUrl)
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      if (tokenData.error?.message?.includes("used")) {
        return NextResponse.json({ error: "Code already used" }, { status: 400 })
      }
      console.error("[fb-oauth] 🔴 Token Error:", JSON.stringify(tokenData, null, 2))
      return NextResponse.json({ error: tokenData.error?.message || "Token failed" }, { status: 400 })
    }

    const userAccessToken = tokenData.access_token

    // 3. Get Facebook User ID and Name
    const meRes = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${userAccessToken}`)
    const meData = await meRes.json()
    const fbUserId = meData.id
    const fbUserName = meData.name || `User_${fbUserId}`

    // 4. Get Facebook Pages managed by the user to get the Page Access Token
    const pagesRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${userAccessToken}`)
    const pagesData = await pagesRes.json()

    if (!pagesRes.ok) {
      console.error("[fb-oauth] 🔴 Pages Error:", JSON.stringify(pagesData, null, 2))
      return NextResponse.json({ error: pagesData.error?.message || "Failed to fetch pages" }, { status: 400 })
    }
    
    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.json({ error: "No Facebook Pages found for this user." }, { status: 400 })
    }

    // 5. Save/Update User in Supabase (Initial state before page selection)
    const supabase = await getSupabaseServerClient()

    const updates: any = {
      username: fbUserName,
      access_token: userAccessToken, // We store the user token temporarily
      token_expires_at: null,
      updated_at: new Date().toISOString(),
      page_id: null,
      business_account_id: null,
    }

    console.log(`[fb-oauth] 💾 Saving FB User initially: ${fbUserName} | fb_id=${fbUserId}`)

    const { error: upsertError } = await supabase
      .from("users")
      .upsert({ id: fbUserId, ...updates }, { onConflict: "id" })

    if (upsertError) throw upsertError

    const response = NextResponse.json({ 
      success: true, 
      username: fbUserName, 
      userId: fbUserId, 
      profilePic: null,
      pages: pagesData.data 
    })
    response.cookies.set("insta_session", JSON.stringify({ username: fbUserName, userId: fbUserId }), {
      path: "/",
      maxAge: 5184000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    return response

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
