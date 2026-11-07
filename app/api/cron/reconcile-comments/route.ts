import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import {
  sendTextDM,
  sendCardDM,
  sendButtonTemplateDM,
  sendMediaDM,
  sendSenderAction,
  replyToComment,
  sleep,
} from "@/lib/instagram-api"

const DEFAULT_PUBLIC_REPLIES = ["Check your DMs! 📥", "Sent! 🔥", "Check inbox! ✨", "Sent you a DM!"]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function keywordMatches(triggerValue: string, text: string): boolean {
  return triggerValue
    .split(",")
    .map((k: string) => k.trim())
    .filter(Boolean)
    .some((k: string) => {
      try {
        return new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)
      } catch {
        return text.includes(k.toLowerCase())
      }
    })
}

function matchesMedia(specificMediaId: string | null | undefined, targetMediaId: string | null | undefined): boolean {
  if (!specificMediaId || !targetMediaId) return false
  const ids = specificMediaId.split(",").map((s: string) => s.trim()).filter(Boolean)
  return ids.includes(targetMediaId)
}

function parseContent(raw: any) {
  if (!raw) return {}
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw)
    } catch {
      return { message: raw }
    }
  }
  return raw
}

async function sendAutomationResponse(
  token: string,
  recipient: { id?: string; comment_id?: string },
  content: any,
  opts: { skipTyping?: boolean; platform?: "ig" | "fb" } = {},
) {
  const platform = opts.platform || "ig"
  const delaySeconds = Number(content.delay_seconds) || 0
  const useTyping = content.typing_indicator === true && recipient.id && !opts.skipTyping

  if (useTyping) await sendSenderAction(token, recipient.id!, "typing_on", platform)
  if (delaySeconds > 0) await sleep(delaySeconds * 1000)

  const quickReplies = Array.isArray(content.quick_replies)
    ? content.quick_replies
        .filter((q: any) => q?.title)
        .map((q: any) => ({
          title: q.title,
          payload: q.payload || `QR_${q.title.toUpperCase().replace(/\s+/g, "_")}`,
        }))
    : undefined

  let result
  if (content.media?.url) {
    result = await sendMediaDM(token, recipient, content.media.type || "image", content.media.url, platform)
    if (result.ok && content.message) {
      if (content.link_url) {
        const btnTitle = (content.link_title || "Open Link").slice(0, 20)
        result = await sendButtonTemplateDM(
          token,
          recipient,
          content.message.slice(0, 640),
          [{ type: "web_url", url: content.link_url, title: btnTitle }],
          platform,
        )
        if (!result?.ok && recipient.comment_id) {
          result = await sendTextDM(token, recipient, `${content.message}\n\n👉 ${content.link_url}`, quickReplies, platform)
        }
      } else {
        result = await sendTextDM(token, recipient, content.message, quickReplies, platform)
      }
    }
  } else if (content.card) {
    result = await sendCardDM(token, recipient, content.card, platform)
  } else if (content.message) {
    if (content.link_url) {
      const btnTitle = (content.link_title || "Open Link").slice(0, 20)
      result = await sendButtonTemplateDM(
        token,
        recipient,
        content.message.slice(0, 640),
        [{ type: "web_url", url: content.link_url, title: btnTitle }],
        platform,
      )
      if (!result?.ok && recipient.comment_id) {
        result = await sendTextDM(token, recipient, `${content.message}\n\n👉 ${content.link_url}`, quickReplies, platform)
      }
    } else {
      result = await sendTextDM(token, recipient, content.message, quickReplies, platform)
    }
  } else {
    result = { ok: false, error: "empty content" }
  }

  if (useTyping) await sendSenderAction(token, recipient.id!, "typing_off", platform)
  return result
}

async function handleReconcile(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  const querySecret = request.nextUrl.searchParams.get("secret")
  const cronSecret = process.env.CRON_SECRET || "b7567cc9b677a01a0aea376d4a7c6ac9"

  if (bearer !== cronSecret && querySecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized: Invalid cron secret" }, { status: 401 })
  }

  const supabase = await getSupabaseServerClient()

  // 1. Get primary user token
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id, access_token, business_account_id, page_id, username")
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  if (userErr || !user?.access_token) {
    return NextResponse.json({ error: "User or access token not found" }, { status: 500 })
  }

  // 2. Fetch active comment automations
  const { data: automations, error: autoErr } = await supabase
    .from("automations")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("trigger_source", "comment")

  if (autoErr || !automations || automations.length === 0) {
    return NextResponse.json({ message: "No active comment automations found", reconciled: [] })
  }

  // 3. Collect all distinct media IDs targeted by these automations
  const mediaIdMap = new Map<string, any[]>()
  for (const auto of automations) {
    if (!auto.specific_media_id) continue
    const ids = auto.specific_media_id.split(",").map((s: string) => s.trim()).filter(Boolean)
    for (const mid of ids) {
      if (!mediaIdMap.has(mid)) mediaIdMap.set(mid, [])
      mediaIdMap.get(mid)!.push(auto)
    }
  }

  const reconciled: any[] = []
  const now = Date.now()
  const cutoffTime = now - 48 * 60 * 60 * 1000 // look back 48 hours

  // 4. Inspect each media's recent comments
  for (const [mediaId, rules] of mediaIdMap.entries()) {
    // Only inspect Instagram media IDs (skip FB prefixed compound IDs for IG API)
    if (mediaId.includes("_")) continue

    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${mediaId}/comments?fields=id,text,from,timestamp,like_count,hidden&limit=50&access_token=${user.access_token}`,
        { signal: AbortSignal.timeout(10000) },
      )
      const json = await res.json()
      if (!json.data || !Array.isArray(json.data)) continue

      for (const comment of json.data) {
        if (!comment.id || !comment.text) continue

        // Check timeframe
        const commentTime = new Date(comment.timestamp).getTime()
        if (commentTime < cutoffTime) continue

        const senderId = comment.from?.id
        const senderUsername = comment.from?.username || "unknown"

        // Ignore comments by page/account itself
        if (senderId === user.business_account_id || senderId === user.page_id || senderUsername === user.username) {
          continue
        }

        const commentText = comment.text.toLowerCase().trim()

        // Match against automation rules
        let matchedRule = rules.find((r: any) => r.trigger_type === "reply_all")
        if (!matchedRule) {
          matchedRule = rules.find(
            (r: any) => r.trigger_type === "keyword" && keywordMatches(r.trigger_value, commentText),
          )
        }

        if (!matchedRule) continue

        // Check if comment already has a reply on Instagram
        const replyRes = await fetch(
          `https://graph.facebook.com/v21.0/${comment.id}/replies?fields=id,from&limit=5&access_token=${user.access_token}`,
          { signal: AbortSignal.timeout(8000) },
        )
        const replyJson = await replyRes.json()
        const hasReplies = Array.isArray(replyJson?.data) && replyJson.data.length > 0

        if (hasReplies) continue // already replied to, skip

        console.log(`[reconcile] 🎯 Found unreplied comment ${comment.id} by @${senderUsername}: "${comment.text}" matching rule "${matchedRule.name}"`)

        const content = parseContent(matchedRule.response_content)
        const replyMode = content.reply_mode || "both"

        // 1. Send public reply if applicable
        if (replyMode !== "dm_only") {
          const pool: string[] =
            Array.isArray(content.public_replies) && content.public_replies.filter(Boolean).length > 0
              ? content.public_replies.filter(Boolean)
              : DEFAULT_PUBLIC_REPLIES
          const publicText = pickRandom(pool)
          await replyToComment(user.access_token, comment.id, publicText, "ig")
        }

        // 2. Send private DM if applicable
        if (replyMode !== "public_only") {
          await sendAutomationResponse(user.access_token, { comment_id: comment.id }, content, { platform: "ig" })
        }

        // 3. Cache into post_comments
        try {
          await supabase.from("post_comments").upsert(
            {
              id: comment.id,
              user_id: user.id,
              platform: "instagram",
              post_id: mediaId,
              post_caption: "Reconciled Post",
              sender_id: senderId,
              sender_username: senderUsername,
              text: comment.text,
              created_at: comment.timestamp || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          )
        } catch (e) {
          console.warn("[reconcile] Failed to upsert post_comment:", e)
        }

        reconciled.push({
          comment_id: comment.id,
          username: senderUsername,
          text: comment.text,
          media_id: mediaId,
          rule: matchedRule.name,
          timestamp: comment.timestamp,
        })
      }
    } catch (err) {
      console.error(`[reconcile] Error checking media ${mediaId}:`, err)
    }
  }

  return NextResponse.json({
    success: true,
    scanned_media_count: mediaIdMap.size,
    reconciled_count: reconciled.length,
    reconciled,
    ran_at: new Date().toISOString(),
  })
}

export async function GET(request: NextRequest) {
  return handleReconcile(request)
}

export async function POST(request: NextRequest) {
  return handleReconcile(request)
}
