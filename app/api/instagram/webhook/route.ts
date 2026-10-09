/* @ts-nocheck */

import crypto from "crypto"
import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { ensureSchema } from "@/lib/supabase-migrate"
import {
  sendTextDM,
  sendCardDM,
  sendButtonTemplateDM,
  sendMediaDM,
  sendSenderAction,
  replyToComment,
  fetchProfile,
  verifyIdOwnership,
  sleep,
  buildFollowGateCard,
} from "@/lib/instagram-api"
import { generateAIReply } from "@/lib/ai-reply"
import { bumpUnlockAttempt, clearUnlockAttempts, unlockKey } from "@/lib/unlock-tracking"

const WEBHOOK_VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN
// Meta signs every webhook POST with HMAC-SHA256 of the raw body. Depending on app setup the
// signing key is the Instagram app secret or the parent Meta app secret, so accept either.
const APP_SECRETS = [process.env.INSTAGRAM_APP_SECRET, process.env.META_APP_SECRET].filter(
  (s): s is string => Boolean(s),
)

function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (APP_SECRETS.length === 0 || !signatureHeader?.startsWith("sha256=")) return false
  const received = signatureHeader.slice("sha256=".length)
  return APP_SECRETS.some((secret) => {
    const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")
    return (
      received.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(received, "utf8"), Buffer.from(expected, "utf8"))
    )
  })
}

const DEFAULT_PUBLIC_REPLIES = ["Check your DMs! 📥", "Sent! 🔥", "Check inbox! ✨"]

// Max times we'll send the gate card for an unverifiable follow status on a single unlock event.
// After this, we send a single "couldn't verify your follow" message and stop spamming the user.
const UNLOCK_GATE_MAX_ATTEMPTS = 3

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && WEBHOOK_VERIFY_TOKEN && token === WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ error: "Invalid token" }, { status: 403 })
}

// ============================================================
// Content parsing — response_content may be object or JSON string
// ============================================================
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

// ============================================================
// Unified response sender — handles text, card, media, quick
// replies, typing indicators, and human-like delays.
// ============================================================
async function sendAutomationResponse(
  token: string,
  recipient: { id?: string; comment_id?: string },
  content: any,
  opts: { skipTyping?: boolean; platform?: 'ig' | 'fb' } = {},
) {
  const platform = opts.platform || 'ig'
  const delaySeconds = Number(content.delay_seconds) || 0
  const useTyping = content.typing_indicator === true && recipient.id && !opts.skipTyping

  if (useTyping) await sendSenderAction(token, recipient.id!, "typing_on", platform)
  if (delaySeconds > 0) await sleep(delaySeconds * 1000)

  const quickReplies = Array.isArray(content.quick_replies)
    ? content.quick_replies
        .filter((q: any) => q?.title)
        .map((q: any) => ({ title: q.title, payload: q.payload || `QR_${q.title.toUpperCase().replace(/\s+/g, "_")}` }))
    : undefined

  let result
  if (content.media?.url) {
    result = await sendMediaDM(token, recipient, content.media.type || "image", content.media.url, platform)
    if (result.ok && content.message) {
      result = await sendTextDM(token, recipient, content.message, quickReplies, platform)
    }
  } else if (content.card) {
    result = await sendCardDM(token, recipient, content.card, platform)
  } else if (content.message) {
    result = await sendTextDM(token, recipient, content.message, quickReplies, platform)
  } else {
    result = { ok: false, error: "empty content" }
  }

  if (useTyping) await sendSenderAction(token, recipient.id!, "typing_off", platform)
  return result
}

function responsePreviewText(content: any): string {
  if (content.message) return content.message
  if (content.card) return `[Card] ${content.card.title}`
  if (content.media?.url) return `[${content.media.type || "media"}]`
  return "[automation]"
}

// ============================================================
// ============================================================
// Follower Gate Verification & Message Resolver
// ============================================================
async function verifyFollowStatus(
  igScopedId: string,
  pageAccessToken: string,
  platform: 'ig' | 'fb' = 'ig',
): Promise<{ follows: boolean; error?: 'auth' | 'transient' }> {
  if (platform === 'fb') {
    // Facebook Graph API does not provide an is_user_follow_business endpoint for Pages.
    // The gate confirmation is completed when the user taps "Following" or sends confirmation.
    return { follows: false }
  }
  try {
    const url = `https://graph.facebook.com/v21.0/${igScopedId}?fields=is_user_follow_business&access_token=${pageAccessToken}`
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[webhook] Follow check failed for ${igScopedId}: ${response.status} ${errorText}`)
      return { follows: false, error: 'auth' }
    }
    const data = await response.json()
    const follows = data.is_user_follow_business === true
    console.log(`[webhook] Follow check for ${igScopedId}: is_user_follow_business=${data.is_user_follow_business} => ${follows ? "FOLLOWS" : "NOT FOLLOWING"}`)
    return { follows }
  } catch (error: any) {
    console.error("[webhook] Error checking follow status:", error)
    return { follows: false, error: 'transient' }
  }
}

function resolveOptInMessage(
  ruleMessage?: string,
  ruleButton?: string,
  userAiContext?: string,
  workflowName?: string,
): { text: string; buttonTitle: string } {
  let text = ruleMessage?.trim()
  let buttonTitle = ruleButton?.trim()
  if (userAiContext) {
    try {
      const parsed = JSON.parse(userAiContext)
      if (!text && parsed.default_opt_in_message?.trim()) {
        text = parsed.default_opt_in_message.trim()
      }
      if (!buttonTitle && parsed.default_opt_in_button?.trim()) {
        buttonTitle = parsed.default_opt_in_button.trim()
      }
    } catch {}
  }
  if (!text) {
    text = workflowName
      ? `Hey! 👋 Here's ${workflowName}. Tap below and I'll send it 👇`
      : "Hey! 👋 Here's the guide: tap below and I'll send it 👇"
  }
  if (!buttonTitle) {
    buttonTitle = "Send me the guide"
  }
  return { text, buttonTitle: buttonTitle.slice(0, 20) }
}

function resolveFollowGreeting(
  ruleMessage?: string,
  userAiContext?: string,
  username?: string,
  platform: 'ig' | 'fb' = 'ig',
): { title: string; subtitle: string; fullText: string } {
  let raw = ruleMessage?.trim()
  if (!raw && userAiContext) {
    try {
      const parsed = JSON.parse(userAiContext)
      if (parsed.default_follow_gate_message?.trim()) {
        raw = parsed.default_follow_gate_message.trim()
      }
    } catch {}
  }
  if (!raw) {
    raw = platform === 'fb'
      ? "Almost there! The guide is for followers 🙌 Follow our page, then tap the button below 👇"
      : `Almost there! The guide is for followers 🙌 Follow @${username || "us"}, then tap the button below 👇`
  }
  if (username) {
    raw = raw.replace(/{username}/g, username)
  }

  const defaultCardTitle = platform === 'fb' ? "Follow our page to unlock" : "Follow to unlock 🔓"
  let title = defaultCardTitle
  let subtitle = raw

  if (raw.length <= 80) {
    subtitle = raw
  } else {
    title = raw.slice(0, 80)
    subtitle = raw.slice(80, 160).trim() || (platform === 'fb' ? "Follow our page, then tap Following below!" : `Follow @${username || "us"}, then tap Following below!`)
  }

  return { title: title.slice(0, 80), subtitle: subtitle.slice(0, 80), fullText: raw }
}

// Unlock-attempt counter is in lib/unlock-tracking.ts -- uses Supabase
// unlock_attempts table so the 3-attempt cap works across Vercel instances.

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    console.log(`\n\n[webhook] --- INCOMING WEBHOOK POST ---`)
    console.log(`[webhook] Raw Body: ${rawBody}`)
    
    const signature = request.headers.get("x-hub-signature-256")
    console.log(`[webhook] Signature Header: ${signature}`)
    if (!isValidSignature(rawBody, signature)) {
      // Hash prefixes are safe to log and let us tell a wrong secret from a mutated body.
      const computed = APP_SECRETS.map(
        (s, i) =>
          `${i === 0 ? "IG" : "META"}:${crypto.createHmac("sha256", s).update(rawBody, "utf8").digest("hex").slice(0, 12)}`,
      ).join(" ")
      console.error(
        `[webhook] 401: ${!signature ? "no x-hub-signature-256 header" : "signature mismatch"}; ` +
          `secrets configured: ${APP_SECRETS.length}; received=${signature?.slice(7, 19) ?? "-"} computed=[${computed}] bodyLen=${rawBody.length}`,
      )
      if (process.env.DISABLE_WEBHOOK_SIGNATURE_CHECK === "true") {
        console.warn("[webhook] SIGNATURE CHECK BYPASSED — remove DISABLE_WEBHOOK_SIGNATURE_CHECK after debugging")
      } else {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }
    const body = JSON.parse(rawBody)
    if (!body.entry) return NextResponse.json({ ok: true })
    // Ensure schema is up-to-date on every cold start (idempotent, no-op if all tables exist)
    ensureSchema().catch((e) => console.warn("[webhook] ensureSchema failed:", e?.message))
    const supabase = await getSupabaseServerClient()

    for (const entry of body.entry) {
      // Skip pure system events (echo / read / delivery)
      if (entry.messaging) {
        const isSystemEvent = entry.messaging.every(
          (event: any) => event.read || event.delivery || (event.message && event.message.is_echo),
        )
        if (isSystemEvent) continue
      }

      const webhookId = entry.id

      // ---------- User resolution: direct, payload fallback, token verify ----------
      let { data: user } = await supabase
        .from("users")
        .select("*")
        .or(`business_account_id.eq.${webhookId},page_id.eq.${webhookId}`)
        .single()

      if (!user) {
        const candidateIds = new Set<string>()
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.value?.media?.owner?.id) candidateIds.add(String(change.value.media.owner.id))
          }
        }
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.recipient?.id) candidateIds.add(String(event.recipient.id))
          }
        }
        for (const candidateId of candidateIds) {
          if (candidateId === webhookId) continue
          const { data: fallbackUser } = await supabase
            .from("users")
            .select("*")
            .or(`business_account_id.eq.${candidateId},page_id.eq.${candidateId}`)
            .single()
          if (fallbackUser) {
            await supabase.from("users").update({ page_id: webhookId }).eq("id", fallbackUser.id)
            user = fallbackUser
            break
          }
        }
      }

      if (!user) {
        const { data: allUsers } = await supabase.from("users").select("*")
        if (allUsers) {
          for (const candidate of allUsers) {
            if (!candidate.access_token) continue
            if (await verifyIdOwnership(candidate.access_token, webhookId)) {
              await supabase.from("users").update({ page_id: webhookId }).eq("id", candidate.id)
              user = candidate
              break
            }
          }
        }
      }

      if (!user) {
        console.log(`[webhook] ❌ Could not resolve user for ID ${webhookId}`)
        continue
      }

      const { data: rawAutomations } = await supabase
        .from("automations")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)

      const automations = rawAutomations || []

      // ============================================================
      //  PART A: COMMENTS
      // ============================================================
      if (entry.changes) {
        for (const change of entry.changes) {
          const isIgComment = change.field === "comments" && change.value?.text
          const isFbComment = change.field === "feed" && change.value?.item === "comment" && change.value?.verb === "add" && change.value?.message
          
          if (!isIgComment && !isFbComment) continue

          const platform = isFbComment ? "fb" : "ig"
          const commentId = isIgComment ? change.value.id : change.value.comment_id
          const commentText = (isIgComment ? change.value.text : change.value.message).toLowerCase().trim()
          const senderId = change.value.from?.id
          const mediaId = isIgComment ? change.value.media?.id : change.value.post_id
          const parentId = change.value.parent_id || null

          if (!senderId || senderId === webhookId || senderId === user.business_account_id || senderId === user.page_id) continue

          // Cache incoming comment in post_comments
          try {
            const rawCommentText = isIgComment ? change.value.text : change.value.message
            const senderName = change.value.from?.name || change.value.from?.username || "User"
            const dbPlatform = isFbComment ? "facebook" : "instagram"
            await supabase.from("post_comments").upsert({
              id: commentId,
              user_id: user.id,
              platform: dbPlatform,
              post_id: mediaId || "unknown",
              post_caption: "Incoming Post",
              parent_comment_id: parentId,
              sender_id: senderId,
              sender_username: senderName,
              text: rawCommentText,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: "id" })
          } catch (e) {
            console.warn("[webhook] Failed to cache post_comment:", e)
          }

          const commentAutomations = automations.filter((a: any) => a.trigger_source === "comment")

          // Priority: specific post reply-all → specific post keyword → global keyword
          let match = commentAutomations.find(
            (a: any) => a.specific_media_id === mediaId && a.trigger_type === "reply_all",
          )
          if (!match) {
            match = commentAutomations.find(
              (a: any) =>
                a.specific_media_id === mediaId &&
                a.trigger_type === "keyword" &&
                keywordMatches(a.trigger_value, commentText),
            )
          }
          if (!match) {
            match = commentAutomations.find(
              (a: any) =>
                !a.specific_media_id &&
                a.trigger_type === "keyword" &&
                keywordMatches(a.trigger_value, commentText),
            )
          }
          if (!match) continue

                    const content = parseContent(match.response_content)

                    // Skip nested replies unless user opted in
                    // Note: Facebook top-level comments have parent_id === post_id
                    const isNestedReply = isFbComment 
                      ? (parentId && parentId !== mediaId) 
                      : Boolean(parentId)

                    if (isNestedReply && content.include_replies !== true) {
                      console.log(`[webhook] ⏭️ Skipping nested reply because include_replies is false`)
                      continue
                    }

                    console.log(`[webhook] ✅ Comment match: "${match.name}"`)

                    // reply_mode: 'both' (default) | 'dm_only' | 'public_only'
                    const replyMode = content.reply_mode || "both"

                    // Helper: pick a public reply from user's rotation list (with defaults fallback)
                    const getPublicReply = (): string => {
                      const pool: string[] =
                        Array.isArray(content.public_replies) && content.public_replies.filter(Boolean).length > 0
                          ? content.public_replies.filter(Boolean)
                          : DEFAULT_PUBLIC_REPLIES
                      return pickRandom(pool)
                    }

                    // ===== COMMENT AUTOMATION (MANYCHAT PATTERN) =====
                    // Step 1: Public reply (if enabled)
                    if (replyMode !== "dm_only") {
                      await replyToComment(user.access_token, commentId, getPublicReply(), platform)
                    }

                    // Step 2: Private reply to comment
                    if (replyMode !== "public_only") {
                      if (content.check_follow === true) {
                        const optIn = resolveOptInMessage(content.opt_in_message, content.opt_in_button, user.ai_context, match.name)
                        console.log(`[webhook] 📩 Sending comment opt-in prompt to @${senderId} for rule "${match.name}"`)
                        
                        const btnResult = await sendButtonTemplateDM(
                          user.access_token,
                          { comment_id: commentId },
                          optIn.text,
                          [{ type: "postback", title: optIn.buttonTitle, payload: `CLAIM_CONTENT_${match.id}` }],
                          platform,
                        )
                        if (!btnResult.ok) {
                          await sendCardDM(
                            user.access_token,
                            { comment_id: commentId },
                            {
                              title: optIn.text.slice(0, 80),
                              subtitle: optIn.text.length > 80 ? optIn.text.slice(80, 160) : undefined,
                              buttons: [{ type: "postback", title: optIn.buttonTitle, payload: `CLAIM_CONTENT_${match.id}` }],
                            },
                            platform,
                          )
                        }
                        await bumpUnlockAttempt(unlockKey(senderId, match.id))
                      } else {
                        console.log(`[webhook] ✅ Follower gate not required: delivering content directly for comment by @${senderId} on rule "${match.name}"`)
                        await sendAutomationResponse(user.access_token, { comment_id: commentId }, content, { platform })
                      }
                    }
        }
      }

      // ============================================================
      //  PART A.5: STORY AUTOMATIONS (mention / reaction / reply)
      // ============================================================
      if (entry.messaging) {
        for (const event of entry.messaging) {
          const senderId = event.sender.id
          const recipientId = event.recipient.id
          if (event.read || event.delivery || event.message?.is_echo || senderId === recipientId) continue

          const storyAutomations = automations.filter((a: any) => a.trigger_source === "story")
          if (storyAutomations.length === 0) continue

          let match = null
          let storyMediaId: string | null = null

          if (event.message?.attachments?.[0]?.type === "story_mention") {
            storyMediaId = event.message.attachments[0].payload?.url || null
            match = storyAutomations.find(
              (a: any) => a.trigger_type === "mention" && (!a.specific_media_id || a.specific_media_id === storyMediaId),
            )
          } else if (event.reaction) {
            const reactionEmoji = event.reaction.emoji
            storyMediaId = event.reaction.mid || null
            match = storyAutomations.find((a: any) => {
              if (a.trigger_type !== "reaction") return false
              if (a.specific_media_id && a.specific_media_id !== storyMediaId) return false
              const triggers = a.trigger_value?.split(",").map((t: string) => t.trim()) || []
              if (triggers.length > 0 && triggers[0] !== "ALL" && triggers[0] !== "ALL_REACTIONS" && triggers[0] !== "") {
                return triggers.includes(reactionEmoji)
              }
              return true
            })
          } else if (event.message?.reply_to?.story) {
            const messageText = event.message.text || ""
            storyMediaId = event.message.reply_to.story.id || null
            match = storyAutomations.find((a: any) => {
              if (a.trigger_type !== "reply") return false
              if (a.specific_media_id && a.specific_media_id !== storyMediaId) return false
              const triggers = a.trigger_value?.split(",").map((t: string) => t.trim()) || []
              if (
                triggers.length > 0 &&
                triggers[0] !== "ALL" &&
                triggers[0] !== "ALL_MENTIONS" &&
                triggers[0] !== ""
              ) {
                return keywordMatches(a.trigger_value, messageText)
              }
              return true
            })
          }

          if (match) {
                                          console.log(`[webhook] ✨ Story match: "${match.name}"`)
                                          const content = parseContent(match.response_content)

                                          if (content.check_follow === true) {
                                            console.log(`[webhook] 🔒 Story follower gate: @${senderId} — sending gate prompt`)
                                            const greeting = resolveFollowGreeting(content.follow_gate_message, user.ai_context, user.username, 'ig')
                                            const btnRes = await sendButtonTemplateDM(
                                              user.access_token,
                                              { id: senderId },
                                              greeting.fullText,
                                              [{ type: "postback", title: "Following", payload: `UNLOCK_CONTENT_${match.id}` }],
                                              'ig',
                                            )
                                            if (!btnRes.ok) {
                                              await sendCardDM(
                                                user.access_token,
                                                { id: senderId },
                                                buildFollowGateCard({
                                                  username: user.username,
                                                  ruleId: match.id,
                                                  title: greeting.title,
                                                  subtitle: greeting.subtitle,
                                                  platform: 'ig',
                                                }),
                                                'ig',
                                              )
                                            }
                                            await bumpUnlockAttempt(unlockKey(senderId, match.id))
                                          } else {
                                            // No follower check required — send normally
                                            await sendAutomationResponse(user.access_token, { id: senderId }, content)
                                          }
                                        }
        }
      }

      // ============================================================
      //  PART B: DIRECT MESSAGES
      // ============================================================
      if (entry.messaging) {
        for (const event of entry.messaging) {
          if (event.read || event.delivery || event.reaction || event.message?.is_echo) continue

          const senderId = event.sender.id
          if (senderId === webhookId || senderId === user.business_account_id || senderId === user.page_id) continue

          let triggerType = ""
          let triggerValue = ""

          if (event.message?.quick_reply?.payload) {
            triggerType = "postback"
            triggerValue = event.message.quick_reply.payload
          } else if (event.message?.text) {
            triggerType = "keyword"
            triggerValue = event.message.text.toLowerCase().trim()
          } else if (event.postback?.payload) {
            triggerType = "postback"
            triggerValue = event.postback.payload
          } else {
            continue
          }

          const isFb = body.object === "page" || event.recipient?.id === user.page_id
          const dmPlatform = isFb ? "facebook" : "instagram"
          console.log(`[webhook] 📩 [${dmPlatform}] DM from ${senderId}: "${triggerValue}"`)

          // Inbox bookkeeping runs alongside delivery, not ahead of it. Always
          // joined below so serverless shutdown cannot discard pending writes.
          const incomingSaved = (async () => {
          let conv = null
          try {
            const { data: existing } = await supabase
              .from("conversations")
              .select("id")
              .eq("user_id", user.id)
              .eq("platform", dmPlatform)
              .eq("recipient_id", senderId)
              .single()

            if (!existing) {
              let realUsername = `cnt_${senderId.slice(0, 5)}...`
              if (!isFb) {
                const profile = await fetchProfile(user.access_token, senderId)
                if (profile?.username) realUsername = profile.username
              }

              const { data: newConv } = await supabase
                .from("conversations")
                .insert({
                  user_id: user.id,
                  recipient_id: senderId,
                  recipient_username: realUsername,
                  platform: dmPlatform,
                  last_message_snippet: triggerValue.slice(0, 150),
                  last_message_at: new Date().toISOString(),
                })
                .select("id")
                .single()
              conv = newConv
            } else {
              conv = existing
              await supabase
                .from("conversations")
                .update({
                  last_message_at: new Date().toISOString(),
                  last_message_snippet: triggerValue.slice(0, 150),
                })
                .eq("id", existing.id)
            }

            if (conv) {
              await supabase.from("messages").insert({
                id: event.message?.mid || `mid_${Date.now()}_${Math.random()}`,
                conversation_id: conv.id,
                user_id: user.id,
                sender_id: senderId,
                sender_username: "User",
                content: triggerValue,
                platform: dmPlatform,
                sender_type: "contact",
                is_from_instagram: !isFb,
              })
            }
          } catch (err) {
            console.error("[webhook] Failed to save incoming message", err)
          }
          return conv
          })()

          try {
          // ---------- Match automation ----------
                    const dmAutomations = automations.filter((a: any) => a.trigger_source === "dm" || !a.trigger_source)
                    let match = null

                    let isClaimEvent = triggerType === "postback" && triggerValue.startsWith("CLAIM_CONTENT_")
                    let isUnlockEvent = triggerType === "postback" && triggerValue.startsWith("UNLOCK_CONTENT_")

                    if (!isClaimEvent && !isUnlockEvent && triggerType === "keyword") {
                      const normVal = triggerValue.toLowerCase().trim()
                      if (["send me the guide", "send the guide", "send guide", "send it", "claim"].some(k => normVal.includes(k))) {
                        const { data: attempts } = await supabase
                          .from("unlock_attempts")
                          .select("key")
                          .like("key", `${senderId}::%`)
                          .order("updated_at", { ascending: false })
                          .limit(1)

                        let pendingRuleId = attempts?.[0]?.key?.split("::")?.[1]
                        if (pendingRuleId) {
                          match = automations.find((a: any) => a.id === pendingRuleId)
                        }
                        if (!match) {
                          match = automations.find((a: any) => a.trigger_source === "comment") || automations[0]
                        }
                        if (match) {
                          isClaimEvent = true
                          triggerType = "postback"
                          triggerValue = `CLAIM_CONTENT_${match.id}`
                        }
                      } else if (["following", "i followed", "followed", "i am following", "already followed"].some(k => normVal.includes(k))) {
                        const { data: attempts } = await supabase
                          .from("unlock_attempts")
                          .select("key")
                          .like("key", `${senderId}::%`)
                          .order("updated_at", { ascending: false })
                          .limit(1)

                        let pendingRuleId = attempts?.[0]?.key?.split("::")?.[1]
                        if (pendingRuleId) {
                          match = automations.find((a: any) => a.id === pendingRuleId)
                        }
                        if (!match) {
                          match = automations.find((a: any) => {
                            const c = parseContent(a.response_content)
                            return c.check_follow === true
                          })
                        }
                        if (match) {
                          isUnlockEvent = true
                          triggerType = "postback"
                          triggerValue = `UNLOCK_CONTENT_${match.id}`
                        }
                      }
                    }

                    if (triggerType === "postback") {
                      if (isClaimEvent) {
                        const ruleId = triggerValue.replace("CLAIM_CONTENT_", "")
                        match = automations.find((a) => a.id === ruleId)
                      } else if (isUnlockEvent) {
                        const ruleId = triggerValue.replace("UNLOCK_CONTENT_", "")
                        match = automations.find((a) => a.id === ruleId)
                      } else if (triggerValue.startsWith("ICE_BREAKER_")) {
                        const iceBreakerId = triggerValue.replace("ICE_BREAKER_", "")
                        const { data: ib } = await supabase
                          .from("ice_breakers")
                          .select("*")
                          .eq("id", iceBreakerId)
                          .eq("user_id", user.id)
                          .single()
                        if (ib) {
                          match = { name: "Ice Breaker: " + ib.question, response_content: { message: ib.response } }
                        }
                      } else {
                        match = automations.find((a) => a.trigger_type === "postback" && a.trigger_value === triggerValue)
                        // Quick reply payloads can also match keyword rules
                        if (!match) {
                          match = dmAutomations.find(
                            (a) => a.trigger_type === "keyword" && keywordMatches(a.trigger_value, triggerValue.toLowerCase()),
                          )
                        }
                      }
                    } else {
                      match = dmAutomations.find(
                        (a) => a.trigger_type === "keyword" && keywordMatches(a.trigger_value, triggerValue),
                      )
                    }

                    if (!match) {
                      // AI fallback: if no keyword rule matched, try AI auto-reply
                      if (user.groq_auto_reply_enabled && triggerType !== "postback") {
                        console.log(`[webhook] 🤖 No rule match — trying AI auto-reply for DM from ${senderId}`)
                        await sendSenderAction(user.access_token, senderId, "mark_seen")
                        const conv = await incomingSaved // AI needs history; keyword replies do not.
                        const { data: recentMessages } = conv
                          ? await supabase
                              .from("messages")
                              .select("content, is_from_instagram")
                              .eq("conversation_id", conv.id)
                              .order("created_at", { ascending: false })
                              .limit(10)
                          : { data: [] }
                        const history = (recentMessages || []).reverse().map((message: any) => ({
                          role: message.is_from_instagram ? "user" as const : "assistant" as const,
                          content: message.content,
                        }))
                        const aiReply = await generateAIReply(triggerValue, user.ai_context || "", history, user.groq_api_key, user.ai_base_url, user.ai_model)
                        if (aiReply) {
                          await sendSenderAction(user.access_token, senderId, "typing_on")
                          const result = await sendTextDM(user.access_token, { id: senderId }, aiReply)
                          if (result?.ok && conv) {
                            try {
                              await supabase.from("messages").insert({
                                id: `mid_ai_${Date.now()}_${Math.random()}`,
                                conversation_id: conv.id,
                                user_id: user.id,
                                sender_id: user.business_account_id,
                                sender_username: user.username,
                                content: aiReply,
                                is_from_instagram: false,
                              })
                            } catch (e) {
                              console.error("[webhook] Failed to save AI reply", e)
                            }
                          }
                        }
                      }
                      continue
                    }

                    if (!match) continue

                    console.log(`[webhook] ✅ DM match: "${match.name}"`)
                    const content = parseContent(match.response_content)

                    // Mark message as seen for human-like flow
                    if (content.mark_seen !== false) {
                      await sendSenderAction(user.access_token, senderId, "mark_seen")
                    }

                    // ---------- Follow gate for DMs ----------
                    const attemptKey = unlockKey(senderId, match.id)
                    const currentPlatform: 'ig' | 'fb' = isFb ? 'fb' : 'ig'

                    if (isClaimEvent) {
                      console.log(`[webhook] 📩 Claim event from @${senderId} for rule "${match.name}"`)
                      if (content.check_follow === true) {
                        const greeting = resolveFollowGreeting(content.follow_gate_message, user.ai_context, user.username, currentPlatform)
                        const btnRes = await sendButtonTemplateDM(
                          user.access_token,
                          { id: senderId },
                          greeting.fullText,
                          [{ type: "postback", title: "Following", payload: `UNLOCK_CONTENT_${match.id}` }],
                          currentPlatform,
                        )
                        if (!btnRes.ok) {
                          await sendCardDM(
                            user.access_token,
                            { id: senderId },
                            buildFollowGateCard({
                              username: user.username,
                              ruleId: match.id,
                              title: greeting.title,
                              subtitle: greeting.subtitle,
                              platform: currentPlatform,
                              pageId: user.page_id,
                            }),
                            currentPlatform,
                          )
                        }
                        await bumpUnlockAttempt(attemptKey)
                        const conv = await incomingSaved
                        if (conv) {
                          try {
                            await supabase.from("messages").insert({
                              id: `mid_reply_${Date.now()}_${Math.random()}`,
                              conversation_id: conv.id,
                              user_id: user.id,
                              sender_id: isFb ? user.page_id : user.business_account_id,
                              sender_username: user.username,
                              content: greeting.fullText,
                              is_from_instagram: !isFb,
                            })
                          } catch (e) {}
                        }
                        continue
                      } else {
                        await clearUnlockAttempts(attemptKey)
                        console.log(`[webhook] ✅ Content claimed by @${senderId} on rule "${match.name}" — delivering content`)
                        const result = await sendAutomationResponse(user.access_token, { id: senderId }, content, { platform: currentPlatform })
                        const conv = await incomingSaved
                        if (result?.ok && conv) {
                          try {
                            await supabase.from("messages").insert({
                              id: `mid_reply_${Date.now()}_${Math.random()}`,
                              conversation_id: conv.id,
                              user_id: user.id,
                              sender_id: isFb ? user.page_id : user.business_account_id,
                              sender_username: user.username,
                              content: responsePreviewText(content),
                              is_from_instagram: !isFb,
                            })
                          } catch (e) {}
                        }
                        continue
                      }
                    }

                    if (isUnlockEvent) {
                      await clearUnlockAttempts(attemptKey)
                      console.log(`[webhook] ✅ Follow confirmed: delivering unlocked content to @${senderId} for rule "${match.name}"`)
                      const result = await sendAutomationResponse(user.access_token, { id: senderId }, content, { platform: currentPlatform })
                      const conv = await incomingSaved
                      if (result?.ok && conv) {
                        try {
                          await supabase.from("messages").insert({
                            id: `mid_reply_${Date.now()}_${Math.random()}`,
                            conversation_id: conv.id,
                            user_id: user.id,
                            sender_id: isFb ? user.page_id : user.business_account_id,
                            sender_username: user.username,
                            content: responsePreviewText(content),
                            is_from_instagram: !isFb,
                          })
                        } catch (e) {}
                      }
                      continue
                    }

                    if (content.check_follow === true) {
                      console.log(`[webhook] 🔒 DM follower gate: @${senderId} — sending gate prompt`)
                      const greeting = resolveFollowGreeting(content.follow_gate_message, user.ai_context, user.username, currentPlatform)
                      const btnRes = await sendButtonTemplateDM(
                        user.access_token,
                        { id: senderId },
                        greeting.fullText,
                        [{ type: "postback", title: "Following", payload: `UNLOCK_CONTENT_${match.id}` }],
                        currentPlatform,
                      )
                      if (!btnRes.ok) {
                        await sendCardDM(
                          user.access_token,
                          { id: senderId },
                          buildFollowGateCard({
                            username: user.username,
                            ruleId: match.id,
                            title: greeting.title,
                            subtitle: greeting.subtitle,
                            platform: currentPlatform,
                            pageId: user.page_id,
                          }),
                          currentPlatform,
                        )
                      }
                      await bumpUnlockAttempt(attemptKey)
                      const conv = await incomingSaved
                      if (btnRes?.ok && conv) {
                        try {
                          await supabase.from("messages").insert({
                            id: `mid_reply_${Date.now()}_${Math.random()}`,
                            conversation_id: conv.id,
                            user_id: user.id,
                            sender_id: isFb ? user.page_id : user.business_account_id,
                            sender_username: user.username,
                            content: greeting.fullText,
                            is_from_instagram: !isFb,
                          })
                        } catch (e) {}
                      }
                    } else {
                      // No follower check required
                      const result = await sendAutomationResponse(user.access_token, { id: senderId }, content, { platform: currentPlatform })
                      const conv = await incomingSaved
                      if (result?.ok && conv) {
                        try {
                          await supabase.from("messages").insert({
                            id: `mid_reply_${Date.now()}_${Math.random()}`,
                            conversation_id: conv.id,
                            user_id: user.id,
                            sender_id: isFb ? user.page_id : user.business_account_id,
                            sender_username: user.username,
                            content: responsePreviewText(content),
                            is_from_instagram: !isFb,
                          })
                        } catch (e) {
                          console.error("[webhook] Failed to save outgoing message", e)
                        }
                      }
                    }
          } finally {
            await incomingSaved
          }
        }
      }
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[webhook] Error", error)
    return NextResponse.json({ ok: true })
  }
}
