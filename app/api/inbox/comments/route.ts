import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId")
        const platform = request.nextUrl.searchParams.get("platform")
        const postId = request.nextUrl.searchParams.get("postId")

        const supabase = await getSupabaseServerClient()

        let query = supabase
            .from("post_comments")
            .select("*")
            .order("created_at", { ascending: false })

        if (userId) {
            query = query.eq("user_id", userId)
        }

        if (platform && platform !== "all") {
            query = query.eq("platform", platform)
        }

        if (postId) {
            query = query.eq("post_id", postId)
        }

        const { data: comments, error } = await query

        if (error) throw error

        return NextResponse.json(comments || [])
    } catch (error) {
        console.error("[Inbox Comments] GET error:", error)
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, commentId, message, platform } = body

        if (!commentId || !message?.trim()) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = await getSupabaseServerClient()

        // 1. Fetch user token
        const { data: user } = await supabase
            .from("users")
            .select("access_token, username")
            .eq("id", userId || 1618667293386976)
            .single()

        if (!user?.access_token) {
            return NextResponse.json({ error: "User or access token not found" }, { status: 404 })
        }

        // 2. Fetch comment to know platform
        const { data: existingComment } = await supabase
            .from("post_comments")
            .select("*")
            .eq("id", commentId)
            .single()

        const targetPlatform = platform || existingComment?.platform || 'instagram'

        // 3. Post reply to Meta Graph API
        const endpoint = targetPlatform === 'facebook'
            ? `https://graph.facebook.com/v21.0/${commentId}/comments?access_token=${user.access_token}`
            : `https://graph.facebook.com/v21.0/${commentId}/replies?access_token=${user.access_token}`

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message.trim() })
        })

        const metaData = await res.json()

        if (metaData.error) {
            console.error("[Inbox Comments] Meta Reply Error:", metaData.error)
            return NextResponse.json({ error: metaData.error.message }, { status: 500 })
        }

        // 4. Update Supabase record
        const newReply = {
            id: metaData.id || `rep_${Date.now()}`,
            sender_id: user.username,
            sender_username: user.username,
            text: message.trim(),
            created_at: new Date().toISOString(),
            like_count: 0
        }

        const currentReplies = Array.isArray(existingComment?.replies) ? existingComment.replies : []
        const updatedReplies = [...currentReplies, newReply]

        await supabase
            .from("post_comments")
            .update({
                replies: updatedReplies,
                reply_count: updatedReplies.length,
                updated_at: new Date().toISOString()
            })
            .eq("id", commentId)

        return NextResponse.json({ success: true, reply: newReply })
    } catch (error) {
        console.error("[Inbox Comments] POST error:", error)
        return NextResponse.json({ error: "Failed to post comment reply" }, { status: 500 })
    }
}
