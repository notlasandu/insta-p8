const IG_GRAPH = "https://graph.facebook.com/v21.0"
const FB_GRAPH = "https://graph.facebook.com/v21.0"

export interface IGButton {
  type: "web_url" | "postback"
  title: string
  url?: string
  payload?: string
}

export interface IGCard {
  title: string
  subtitle?: string
  image_url?: string
  buttons: IGButton[]
}

export interface QuickReply {
  title: string
  payload: string
}

export interface SendResult {
  ok: boolean
  id?: string
  error?: any
}

async function post(path: string, token: string, body: any, platform: 'ig' | 'fb' = 'ig'): Promise<SendResult> {
  const graphUrl = platform === 'fb' ? FB_GRAPH : IG_GRAPH;
  try {
    const res = await fetch(`${graphUrl}/${path}?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      console.error(`[api] ${path} failed:`, JSON.stringify(json.error))
      return { ok: false, error: json.error || `HTTP ${res.status}` }
    }
    return { ok: true, id: json.id || json.message_id }
  } catch (e) {
    console.error(`[api] ${path} network error:`, e)
    return { ok: false, error: e }
  }
}

export function buildCardAttachment(card: IGCard) {
  const buttons = (card.buttons || [])
    .filter((b) => b.title)
    .map((b) => ({
      type: b.type,
      title: b.title,
      url: b.type === "web_url" ? b.url : undefined,
      payload: b.type === "postback" ? b.payload : undefined,
    }))
  const element: any = { title: card.title, buttons }
  if (card.subtitle) element.subtitle = card.subtitle
  if (card.image_url?.startsWith("http")) element.image_url = card.image_url
  return {
    attachment: {
      type: "template",
      payload: { template_type: "generic", elements: [element] },
    },
  }
}

/**
 * Build the follower-gate card shown to non-followers. Centralized so the
 * comment, story, and DM branches all share the same copy and the same
 * `as const` button types — preserving the `"web_url"` / `"postback"`
 * literal types that `IGButton` requires.
 */
export function buildFollowGateCard(params: {
  username: string
  ruleId: string
  title?: string
  subtitle?: string
  platform?: 'ig' | 'fb'
  pageId?: string
}): IGCard {
  const isFb = params.platform === 'fb'
  const followUrl = isFb
    ? (params.pageId ? `https://facebook.com/${params.pageId}` : `https://facebook.com/${params.username}`)
    : `https://instagram.com/${params.username}`

  const defaultTitle = isFb ? "Follow our page to unlock" : "Follow to unlock"
  const defaultSubtitle = isFb
    ? "Follow our Facebook page, then tap Following below!"
    : `Follow @${params.username}, then tap Following below!`

  const title = (params.title ?? defaultTitle).slice(0, 80)
  const subtitle = (params.subtitle ?? defaultSubtitle).slice(0, 80)

  return {
    title,
    subtitle,
    buttons: [
      { type: "web_url", url: followUrl, title: "Follow" },
      { type: "postback", title: "Following", payload: `UNLOCK_CONTENT_${params.ruleId}` },
    ],
  }
}

export async function sendTextDM(
  token: string,
  recipient: { id?: string; comment_id?: string },
  text: string,
  quickReplies?: QuickReply[],
  platform: 'ig' | 'fb' = 'ig'
): Promise<SendResult> {
  const message: any = { text }
  if (quickReplies?.length) {
    message.quick_replies = quickReplies.slice(0, 13).map((q) => ({
      content_type: "text",
      title: q.title.slice(0, 20),
      payload: q.payload,
    }))
  }
  return post("me/messages", token, { recipient, message }, platform)
}

export async function sendCardDM(
  token: string,
  recipient: { id?: string; comment_id?: string },
  card: IGCard,
  platform: 'ig' | 'fb' = 'ig'
): Promise<SendResult> {
  return post("me/messages", token, { recipient, message: buildCardAttachment(card) }, platform)
}

export async function sendMediaDM(
  token: string,
  recipient: { id?: string; comment_id?: string },
  mediaType: "image" | "video" | "audio",
  url: string,
  platform: 'ig' | 'fb' = 'ig'
): Promise<SendResult> {
  return post("me/messages", token, {
    recipient,
    message: { attachment: { type: mediaType, payload: { url } } },
  }, platform)
}

export async function sendSenderAction(
  token: string,
  recipientId: string,
  action: "typing_on" | "typing_off" | "mark_seen",
  platform: 'ig' | 'fb' = 'ig'
): Promise<SendResult> {
  return post("me/messages", token, { recipient: { id: recipientId }, sender_action: action }, platform)
}

export async function sendMessageReaction(
  token: string,
  recipientId: string,
  messageId: string,
  reaction = "love",
  platform: 'ig' | 'fb' = 'ig'
): Promise<SendResult> {
  return post("me/messages", token, {
    recipient: { id: recipientId },
    sender_action: "react",
    payload: { message_id: messageId, reaction },
  }, platform)
}

export async function replyToComment(token: string, commentId: string, message: string, platform: 'ig' | 'fb' = 'ig'): Promise<SendResult> {
  const endpoint = platform === 'fb' ? `${commentId}/comments` : `${commentId}/replies`;
  return post(endpoint, token, { message }, platform)
}

export async function fetchProfile(token: string, userId: string, platform: 'ig' | 'fb' = 'ig'): Promise<{ username?: string; name?: string } | null> {
  const graphUrl = platform === 'fb' ? FB_GRAPH : IG_GRAPH;
  try {
    const res = await fetch(`${graphUrl}/${userId}?fields=username,name,first_name,last_name&access_token=${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(5000) })
    const json = await res.json()
    if (!res.ok || json.error) return null
    if (platform === 'fb' && !json.username && json.first_name) {
      json.username = `${json.first_name} ${json.last_name || ''}`.trim()
    }
    return json
  } catch {
    return null
  }
}

export async function verifyIdOwnership(token: string, id: string, platform: 'ig' | 'fb' = 'ig'): Promise<boolean> {
  const graphUrl = platform === 'fb' ? FB_GRAPH : IG_GRAPH;
  try {
    const res = await fetch(`${graphUrl}/${id}?fields=id&access_token=${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch {
    return false
  }
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, Math.min(ms, 8000)))
}
