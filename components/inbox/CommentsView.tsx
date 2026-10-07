"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { CommentPostList } from "./CommentPostList"
import { CommentThreadPane } from "./CommentThreadPane"
import { cn } from "@/lib/utils"
import type { PostComment, InboxPlatform } from "@/types/db"

interface CommentsViewProps {
  userId: string
}

export function CommentsView({ userId }: CommentsViewProps) {
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [platformFilter, setPlatformFilter] = useState<"all" | InboxPlatform>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/inbox/comments?userId=${userId}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setComments(data)
        if (data.length > 0 && !selectedPostId) {
          setSelectedPostId(data[0].post_id)
        }
      }
    } catch (e) {
      console.error("Failed to load comments", e)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [userId])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetch("/api/inbox/sync", { method: "POST" })
    } catch (e) {
      console.warn("Sync triggered with error", e)
    }
    await fetchComments()
  }

  const handleReplySuccess = (commentId: string, newReply: any) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const current = Array.isArray(c.replies) ? c.replies : []
          return {
            ...c,
            reply_count: current.length + 1,
            replies: [...current, newReply],
          }
        }
        return c
      })
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full relative">
      <div
        className={cn(
          "w-full md:w-[350px] shrink-0 border-r border-border bg-card h-full flex flex-col",
          selectedPostId ? "hidden md:flex" : "flex"
        )}
      >
        <CommentPostList
          comments={comments}
          selectedPostId={selectedPostId}
          platformFilter={platformFilter}
          onSelectPost={(id) => setSelectedPostId(id)}
          onPlatformChange={(p) => setPlatformFilter(p)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      <div
        className={cn(
          "flex-1 min-w-0 bg-card h-full flex flex-col",
          selectedPostId ? "flex" : "hidden md:flex"
        )}
      >
        <CommentThreadPane
          comments={comments}
          selectedPostId={selectedPostId}
          userId={userId}
          onBack={() => setSelectedPostId(null)}
          onReplySuccess={handleReplySuccess}
        />
      </div>
    </div>
  )
}
