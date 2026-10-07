"use client"

import { useEffect, useState, useMemo } from "react"
import { Search, Loader2, UserCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Conversation, InboxPlatform } from "@/types/db"

interface ConversationListProps {
  userId: string
  selectedId: string | null
  onSelect: (id: string, username: string, recipientId: string, platform: InboxPlatform) => void
}

export function ConversationList({ userId, selectedId, onSelect }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [platformFilter, setPlatformFilter] = useState<"all" | InboxPlatform>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchConversations = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/inbox/conversations?userId=${userId}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setConversations(data)
      }
    } catch (error) {
      console.error("Failed to load conversations", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [userId])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetch("/api/inbox/sync", { method: "POST" })
    } catch (e) {
      console.warn("Manual sync error", e)
    }
    await fetchConversations()
  }

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (platformFilter !== "all" && c.platform !== platformFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = c.recipient_username.toLowerCase().includes(q)
        const matchesSnippet = (c.last_message_snippet || "").toLowerCase().includes(q)
        return matchesName || matchesSnippet
      }
      return true
    })
  }, [conversations, platformFilter, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border-r border-border bg-card w-full md:w-[350px]">
      <div className="p-3 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Direct Messages</span>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="h-7 w-7 text-muted-foreground">
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-lg text-xs">
          {(["all", "instagram", "facebook"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={cn(
                "flex-1 py-1 rounded-md text-center font-medium capitalize transition-colors",
                platformFilter === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p === "all" ? "All" : p === "instagram" ? "Instagram" : "Messenger"}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            className="w-full bg-background border border-input rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs">
            No conversations found.
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedId === conv.id
            const isFb = conv.platform === "facebook"
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv.id, conv.recipient_username, conv.recipient_id.toString(), conv.platform)}
                className={cn(
                  "p-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors border",
                  isSelected ? "bg-accent border-border" : "border-transparent hover:bg-accent/60"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 relative">
                  <UserCircle className="w-6 h-6 text-muted-foreground" />
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white font-bold",
                      isFb ? "bg-blue-600" : "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600"
                    )}
                  >
                    {isFb ? "FB" : "IG"}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-xs truncate text-foreground">
                      {conv.recipient_username}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-1">
                      {new Date(conv.last_message_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {conv.last_message_snippet || "Open to view conversation"}
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
