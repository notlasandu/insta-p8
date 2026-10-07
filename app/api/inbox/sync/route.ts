import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient()

        // Fetch User and Access Token
        const { data: user } = await supabase
            .from("users")
            .select("id, access_token, page_id, business_account_id")
            .limit(1)
            .single()

        if (!user?.access_token) {
            return NextResponse.json({ error: "No user or access token found" }, { status: 400 })
        }

        const token = user.access_token
        const pageId = user.page_id || "1353894244476166"
        const igId = user.business_account_id || "17841423877461958"
        const userId = user.id

        // 1. Sync FB Conversations
        try {
            const fbRes = await fetch(
                `https://graph.facebook.com/v21.0/${pageId}/conversations?fields=id,updated_time,participants,messages{id,message,from,to,created_time}&access_token=${token}`
            )
            const fbData = await fbRes.json()
            if (fbData.data) {
                for (const thread of fbData.data) {
                    const participants = thread.participants?.data || []
                    const contact = participants.find((p: any) => p.id !== pageId) || participants[0] || { id: "unknown", name: "User" }
                    const messages = thread.messages?.data || []
                    const latestMessage = messages[0]?.message || ""

                    const { data: conv } = await supabase
                        .from("conversations")
                        .upsert(
                            {
                                user_id: userId,
                                recipient_id: contact.id,
                                recipient_username: contact.name,
                                platform: "facebook",
                                thread_id: thread.id,
                                last_message_snippet: latestMessage.slice(0, 150),
                                last_message_at: thread.updated_time,
                            },
                            { onConflict: "user_id,platform,recipient_id" }
                        )
                        .select("id")
                        .single()

                    if (conv) {
                        for (const msg of messages) {
                            if (!msg.message) continue
                            const isUser = msg.from?.id === pageId
                            await supabase.from("messages").upsert(
                                {
                                    id: msg.id,
                                    conversation_id: conv.id,
                                    user_id: userId,
                                    sender_id: msg.from?.id || contact.id,
                                    sender_username: msg.from?.name || contact.name,
                                    content: msg.message,
                                    platform: "facebook",
                                    sender_type: isUser ? "user" : "contact",
                                    is_from_instagram: false,
                                    created_at: msg.created_time,
                                },
                                { onConflict: "id" }
                            )
                        }
                    }
                }
            }
        } catch (e) {
            console.error("[Sync] FB conversations sync error:", e)
        }

        // 2. Sync IG Comments
        try {
            const igRes = await fetch(
                `https://graph.facebook.com/v21.0/${igId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,comments{id,text,username,timestamp,like_count,replies{id,text,username,timestamp,like_count}}&limit=15&access_token=${token}`
            )
            const igData = await igRes.json()
            if (igData.data) {
                for (const media of igData.data) {
                    for (const comment of media.comments?.data || []) {
                        if (!comment.text) continue
                        const replies = (comment.replies?.data || []).map((r: any) => ({
                            id: r.id,
                            sender_id: r.username || "unknown",
                            sender_username: r.username || "User",
                            text: r.text,
                            created_at: r.timestamp,
                            like_count: r.like_count || 0,
                        }))

                        await supabase.from("post_comments").upsert(
                            {
                                id: comment.id,
                                user_id: userId,
                                platform: "instagram",
                                post_id: media.id,
                                post_caption: media.caption ? media.caption.slice(0, 120) : "Instagram Media",
                                post_media_url: media.thumbnail_url || media.media_url || null,
                                post_permalink: media.permalink || null,
                                parent_comment_id: null,
                                sender_id: comment.username || "unknown",
                                sender_username: comment.username || "User",
                                text: comment.text,
                                like_count: comment.like_count || 0,
                                reply_count: replies.length,
                                replies,
                                created_at: comment.timestamp,
                                updated_at: new Date().toISOString(),
                            },
                            { onConflict: "id" }
                        )
                    }
                }
            }
        } catch (e) {
            console.error("[Sync] IG comments sync error:", e)
        }

        return NextResponse.json({ success: true, message: "Sync completed" })
    } catch (err: any) {
        console.error("[Sync] Failed:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
