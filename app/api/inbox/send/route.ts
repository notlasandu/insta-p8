import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, recipientId, message, attachment, platform, conversationId } = body

        if (!userId || !recipientId || (!message && !attachment)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = await getSupabaseServerClient()

        // 1. Get User Access Token & IDs
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("access_token, username, business_account_id, page_id")
            .eq("id", userId)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // 2. Resolve Conversation & Target Platform
        let conv: any = null
        if (conversationId) {
            const { data } = await supabase.from("conversations").select("*").eq("id", conversationId).single()
            conv = data
        }
        if (!conv) {
            const { data } = await supabase
                .from("conversations")
                .select("*")
                .eq("user_id", userId)
                .eq("recipient_id", recipientId)
                .single()
            conv = data
        }

        const targetPlatform = platform || conv?.platform || 'facebook'

        // 3. Dispatch to Meta Graph API
        const apiBody: any = { recipient: { id: recipientId } }
        if (message) {
            apiBody.message = { text: message }
        } else if (attachment) {
            apiBody.message = { attachment }
        }

        const endpoint = targetPlatform === 'instagram'
            ? `https://graph.facebook.com/v21.0/${user.page_id || 'me'}/messages?platform=instagram&access_token=${user.access_token}`
            : `https://graph.facebook.com/v21.0/me/messages?access_token=${user.access_token}`

        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiBody)
        })

        const data = await res.json()

        if (data.error) {
            console.error(`[Inbox Send] ${targetPlatform} API Error:`, data.error)
            return NextResponse.json({ error: data.error.message }, { status: 500 })
        }

        // 4. Record Outbound Message in DB
        const snippet = (message || "[Attachment]").slice(0, 150)
        if (conv) {
            await supabase.from("messages").insert({
                id: data.message_id || `mid_out_${Date.now()}_${Math.random()}`,
                conversation_id: conv.id,
                user_id: userId,
                sender_id: user.page_id || user.business_account_id,
                sender_username: user.username,
                content: message || "[Attachment]",
                platform: targetPlatform,
                sender_type: 'user',
                is_from_instagram: false,
                status: 'delivered'
            })

            await supabase
                .from("conversations")
                .update({
                    last_message_at: new Date().toISOString(),
                    last_message_snippet: snippet
                })
                .eq("id", conv.id)
        }

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error("[Inbox Send] Internal Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
