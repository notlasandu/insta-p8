"use client"

import { useState } from "react"
import { Send, Loader2, ExternalLink, CornerDownRight, MessageSquare, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PostComment } from "@/types/db"

interface CommentThreadPaneProps {
  comments: PostComment[]
  selectedPostId: string | null
  userId: string
  onBack?: () => void
  onReplySuccess: (commentId: string, reply: any) => void
}

export function CommentThreadPane({
  comments,
  selectedPostId,
  userId,
  onBack,
  onReplySuccess,
}: CommentThreadPaneProps) {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const postComments = comments.filter((c) => c.post_id === selectedPostId)
  const currentPost = postComments[0]

  if (!selectedPostId || !currentPost) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center bg-card h-full p-6">
        <div className="w-14 h-14 rounded-full bg-muted border border-border flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Select a Post</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Choose a post from the left sidebar to view customer comments and send replies.
        </p>
      </div>
    )
  }

  const handleSendReply = async (commentId: string, platform: string) => {
    if (!replyText.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/inbox/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, commentId, message: replyText.trim(), platform }),
      })
      const data = await res.json()
      if (res.ok && data.reply) {
        onReplySuccess(commentId, data.reply)
        setReplyText("")
        setActiveReplyId(null)
      } else {
        alert(data.error || "Failed to post reply")
      }
    } catch (e: any) {
      alert(e.message || "Network error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border flex items-center justify-between gap-3 bg-muted/40">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden h-8 w-8 -ml-1 text-muted-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider shrink-0",
            currentPost.platform === "instagram" ? "bg-gradient-to-r from-pink-500 to-purple-600" : "bg-blue-600"
          )}>
            {currentPost.platform}
          </span>
          <p className="text-xs text-foreground truncate font-medium">{currentPost.post_caption}</p>
        </div>
        {currentPost.post_permalink && (
          <a href={currentPost.post_permalink} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 shrink-0 hover:underline">
            <span>View</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {postComments.map((comment) => (
          <div key={comment.id} className="p-3.5 rounded-xl bg-card border border-border shadow-sm space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-bold text-xs text-foreground">
                  {comment.sender_username.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">@{comment.sender_username}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setActiveReplyId(activeReplyId === comment.id ? null : comment.id); setReplyText("") }}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Reply
              </Button>
            </div>
            <p className="text-xs text-foreground leading-relaxed pl-9">{comment.text}</p>
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-9 mt-2 pl-3 border-l-2 border-border/70 space-y-2">
                {comment.replies.map((rep, idx) => (
                  <div key={rep.id || idx} className="text-xs bg-muted/50 p-2 rounded-lg">
                    <div className="font-semibold text-[11px] text-foreground">@{rep.sender_username}</div>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{rep.text}</p>
                  </div>
                ))}
              </div>
            )}
            {activeReplyId === comment.id && (
              <div className="ml-9 mt-3 flex items-center gap-2 pt-2 border-t border-border">
                <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  className="flex-1 bg-muted px-3 py-1.5 rounded-lg text-xs text-foreground focus:outline-none placeholder:text-muted-foreground"
                  placeholder={`Reply to @${comment.sender_username}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !isSubmitting) { e.preventDefault(); handleSendReply(comment.id, comment.platform) } }}
                  disabled={isSubmitting}
                  autoFocus
                />
                <Button size="icon" onClick={() => handleSendReply(comment.id, comment.platform)} disabled={isSubmitting || !replyText.trim()} className="h-7 w-7 rounded-lg">
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
