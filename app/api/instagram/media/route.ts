import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

    const supabase = await getSupabaseServerClient()

    // 1. Get Access Token, IG Business Account ID, and FB Page ID
    const { data: user } = await supabase
      .from("users")
      .select("access_token, business_account_id, page_id")
      .eq("id", userId)
      .single()

    if (!user?.access_token) {
      return NextResponse.json({ error: "Instagram not connected" }, { status: 401 })
    }

    if (!user?.business_account_id && !user?.page_id) {
      return NextResponse.json({ error: "No accounts linked to this profile" }, { status: 400 })
    }

    // 2. Fetch Media Concurrently
    const promises = []

    if (user.business_account_id) {
      const igUrl = `https://graph.facebook.com/v20.0/${user.business_account_id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=24&access_token=${user.access_token}`
      promises.push(
        fetch(igUrl, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => ({ source: 'ig', data }))
          .catch(err => ({ source: 'ig', error: err }))
      )
    }

    if (user.page_id) {
      const fbUrl = `https://graph.facebook.com/v20.0/${user.page_id}/posts?fields=id,message,created_time,full_picture,permalink_url&limit=24&access_token=${user.access_token}`
      promises.push(
        fetch(fbUrl, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => ({ source: 'fb', data }))
          .catch(err => ({ source: 'fb', error: err }))
      )
    }

    const results = await Promise.all(promises)
    let allMedia: any[] = []

    for (const result of results as any[]) {
      if (result.error || result.data?.error) {
        console.error(`[v0] ${result.source.toUpperCase()} Media Error:`, result.error || result.data.error)
        if (result.data?.error?.code === 190) {
           return NextResponse.json({ error: "Session Expired. Please Logout & Login." }, { status: 401 })
        }
        continue // Skip this source if it fails but try the other
      }

      if (result.source === 'ig') {
        const igMedia = (result.data.data || []).map((m: any) => ({
          ...m,
          image_url: m.thumbnail_url || m.media_url || null,
        }))
        allMedia = [...allMedia, ...igMedia]
      } else if (result.source === 'fb') {
        const fbMedia = (result.data.data || []).map((p: any) => ({
          id: p.id,
          caption: p.message,
          media_type: "FB_POST",
          media_url: p.full_picture,
          thumbnail_url: p.full_picture,
          permalink: p.permalink_url,
          timestamp: p.created_time,
          image_url: p.full_picture || null,
        }))
        allMedia = [...allMedia, ...fbMedia]
      }
    }

    const normalized = allMedia
      .filter((m: any) => typeof m.image_url === "string" && m.image_url.length > 0)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Sort combined feeds by newest

    return NextResponse.json({ data: normalized })
  } catch (error) {
    console.error("[v0] Server Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}
