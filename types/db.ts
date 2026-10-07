export type InboxPlatform = 'instagram' | 'facebook'

export interface Conversation {
    id: string
    user_id: string
    recipient_id: string
    recipient_username: string
    platform: InboxPlatform
    thread_id?: string
    last_message_snippet?: string
    unread_count?: number
    last_message_at: string
    created_at: string
    updated_at: string
}

export interface Message {
    id: string
    conversation_id: string
    user_id: string
    sender_id: string
    sender_username?: string
    content: string
    platform: InboxPlatform
    sender_type?: 'contact' | 'user' | 'bot'
    attachments?: any[]
    status?: string
    is_from_instagram: boolean
    created_at: string
}

export interface IceBreaker {
    id: string
    user_id: string
    question: string
    response: string
    is_active: boolean
    created_at: string
}

export interface CommentReply {
    id: string
    sender_id: string
    sender_username: string
    text: string
    created_at: string
    like_count?: number
}

export interface PostComment {
    id: string
    user_id: number | string
    platform: InboxPlatform
    post_id: string
    post_caption?: string
    post_media_url?: string
    post_permalink?: string
    parent_comment_id?: string | null
    sender_id: string
    sender_username: string
    text: string
    like_count: number
    reply_count: number
    replies: CommentReply[]
    created_at: string
    updated_at: string
}

