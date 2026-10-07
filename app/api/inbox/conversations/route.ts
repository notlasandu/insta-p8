import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get("userId")
        const platform = request.nextUrl.searchParams.get("platform")
        const search = request.nextUrl.searchParams.get("search")

        if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

        const supabase = await getSupabaseServerClient()

        let query = supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .order("last_message_at", { ascending: false })

        if (platform && platform !== "all") {
            query = query.eq("platform", platform)
        }

        if (search) {
            query = query.ilike("recipient_username", `%${search}%`)
        }

        const { data: conversations, error } = await query

        if (error) throw error

        return NextResponse.json(conversations)
    } catch (error) {
        console.error("[Inbox] Conversations GET error:", error)
        return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
    }
}
