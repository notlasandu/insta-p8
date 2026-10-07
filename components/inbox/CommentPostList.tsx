"use client"

import { useMemo } from "react"
import { MessageSquare, RefreshCw, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PostComment, InboxPlatform } from "@/types/db"

interface CommentPostListProps {
  comments: PostComment[]
  selectedPostId: string | null
  platformFilter: "all" | InboxPlatform
  onSelectPost: (postId: string) => void
  onPlatformChange: (platform: "all" | InboxPlatform) => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function CommentPostList({
  comments,
  selectedPostId,
  platformFilter,
  onSelectPost,
  onPlatformChange,
  onRefresh,
  isRefreshing,
}: CommentPostListProps) {
  const posts = useMemo(() => {
    const postMap = new Map<string, {
      postId: string
      caption: string
      platform: InboxPlatform
      mediaUrl?: string
      permalink?: string
      commentCount: number
      latestDate: string
    }>()

    for (const c of comments) {
      if (platformFilter !== "all" && c.platform !== platformFilter) continue
      const existing = postMap.get(c.post_id)
      if (!existing) {
        postMap.set(c.post_id, {
          postId: c.post_id,
          caption: c.post_caption || "Untitled Post",
          platform: c.platform,
          mediaUrl: c.post_media_url,
          permalink: c.post_permalink,
          commentCount: 1,
          latestDate: c.created_at,
        })
      } else {
        existing.commentCount += 1
        if (new Date(c.created_at) > new Date(existing.latestDate)) {
          existing.latestDate = c.created_at
        }
      }
    }

    return Array.from(postMap.values()).sort(
      (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
    )
  }, [comments, platformFilter])

  return (
    <div className="flex flex-col h-full border-r border-border bg-card w-full md:w-[350px]">
      <div className="p-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Posts With Comments</span>
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isRefreshing} className="h-7 w-7 text-muted-foreground">
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs">
          {(["all", "instagram", "facebook"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPlatformChange(p)}
              className={cn(
                "flex-1 py-1 rounded-md text-center font-medium capitalize transition-colors",
                platformFilter === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p === "all" ? "All" : p === "instagram" ? "Instagram" : "Facebook"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {posts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs">
            No comments found for this filter.
          </div>
        ) : (
          posts.map((post) => {
            const isSelected = selectedPostId === post.postId
            return (
              <div
                key={post.postId}
                onClick={() => onSelectPost(post.postId)}
                className={cn(
                  "p-2.5 rounded-lg flex items-start gap-3 cursor-pointer transition-colors border",
                  isSelected ? "bg-accent border-border" : "border-transparent hover:bg-accent/60"
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center relative">
                  {post.mediaUrl ? (
                    <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white",
                      post.platform === "instagram" ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600" : "bg-blue-600"
                    )}
                  >
                    {post.platform === "instagram" ? "IG" : "FB"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {post.platform}
                    </span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">
                      {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2 leading-snug">
                    {post.caption}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
