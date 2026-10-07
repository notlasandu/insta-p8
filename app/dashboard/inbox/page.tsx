"use client"

import { useState } from "react"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { ConversationList } from "@/components/inbox/ConversationList"
import { ChatWindow } from "@/components/inbox/ChatWindow"
import { CommentsView } from "@/components/inbox/CommentsView"
import { Loader2, MessageSquare, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import type { InboxPlatform } from "@/types/db"

export default function InboxPage() {
    const { userId, isLoading } = useInstagramSession()
    const [activeTab, setActiveTab] = useState<"dm" | "comments">("dm")
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
    const [selectedRecipientName, setSelectedRecipientName] = useState<string | null>(null)
    const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null)
    const [selectedPlatform, setSelectedPlatform] = useState<InboxPlatform>("facebook")

    const handleSelect = (id: string, name: string, recipientId: string, platform: InboxPlatform) => {
        setSelectedConversationId(id)
        setSelectedRecipientName(name)
        setSelectedRecipientId(recipientId)
        setSelectedPlatform(platform)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
        )
    }

    if (!userId) {
        return null
    }

    return (
        <div className="h-[calc(100vh-3rem)] m-6 rounded-xl overflow-hidden border border-border bg-card flex flex-col">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40 shrink-0">
                <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
                    <button
                        onClick={() => setActiveTab("dm")}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            activeTab === "dm"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Send className="w-3.5 h-3.5" />
                        <span>Direct Messages</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("comments")}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            activeTab === "comments"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Post Comments</span>
                    </button>
                </div>

                <div className="text-[11px] text-muted-foreground hidden sm:block">
                    Unified FB & IG Messaging Hub
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex">
                {activeTab === "dm" ? (
                    <>
                        {/* Left Sidebar: Conversation List */}
                        <div className={cn(
                            "w-full md:w-[350px] shrink-0 border-r border-border bg-card h-full flex flex-col",
                            selectedConversationId ? "hidden md:flex" : "flex"
                        )}>
                            <ConversationList
                                userId={userId}
                                selectedId={selectedConversationId}
                                onSelect={handleSelect}
                            />
                        </div>

                        {/* Right Main: Chat Window */}
                        <div className={cn(
                            "flex-1 min-w-0 bg-card h-full flex flex-col",
                            selectedConversationId ? "flex" : "hidden md:flex"
                        )}>
                            <ChatWindow
                                conversationId={selectedConversationId}
                                recipientName={selectedRecipientName}
                                recipientId={selectedRecipientId || undefined}
                                platform={selectedPlatform}
                                userId={userId}
                                onBack={() => setSelectedConversationId(null)}
                            />
                        </div>
                    </>
                ) : (
                    <CommentsView userId={userId} />
                )}
            </div>
        </div>
    )
}
