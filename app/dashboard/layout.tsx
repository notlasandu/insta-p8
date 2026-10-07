"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { Loader2, Zap } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { username, profilePic, logout, isLoading, isConnected, pendingPages, selectPage } = useInstagramSession()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    useEffect(() => {
        setSidebarCollapsed(localStorage.getItem("insta-p8-sidebar") === "collapsed")
    }, [])

    const toggleSidebar = () => {
        setSidebarCollapsed(value => {
            const next = !value
            localStorage.setItem("insta-p8-sidebar", next ? "collapsed" : "expanded")
            return next
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-50 transition-[width] duration-200 ${sidebarCollapsed ? "md:w-[72px]" : "md:w-64"}`}>
                <Sidebar
                    className="h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
                    username={username || "User"}
                    profilePic={profilePic}
                    onLogout={logout}
                    collapsed={sidebarCollapsed}
                    onToggle={toggleSidebar}
                />
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-[padding] duration-200 ${sidebarCollapsed ? "md:pl-[72px]" : "md:pl-64"}`}>
                {/* Mobile Header (Visible only on small screens) */}
                <header className="md:hidden h-16 border-b border-border bg-background flex items-center justify-between px-4 sticky top-0 z-40">
                    <span className="font-serif-display text-xl text-foreground">insta-p8</span>
                    <MobileNav username={username || "User"} profilePic={profilePic} onLogout={logout} />
                </header>

                <main className="dashboard-canvas flex-1 relative overflow-auto">
                    {children}
                </main>
            </div>
            
            {/* Business Portfolio Not Connected Modal */}
            {!isConnected && (!pendingPages || pendingPages.length === 0) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-background border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Zap className="size-6" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight mb-2">Connect Business Portfolio</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            This workspace is locked to your single account. Please connect your Meta Business Portfolio (Instagram Professional account & Facebook Page) to activate automations and analytics.
                        </p>
                        
                        <button
                            onClick={() => {
                                const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID
                                const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || `${window.location.origin}/api/instagram/callback`
                                window.location.href = `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=pages_show_list,pages_messaging,pages_read_engagement,pages_manage_engagement,pages_manage_metadata,instagram_basic,instagram_manage_messages,instagram_manage_comments`
                            }}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <span>Connect with Meta</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Page Selection Modal */}
            {pendingPages && pendingPages.length > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-background border border-border w-full max-w-md rounded-xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-2">Select a Facebook Page</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Choose the Facebook Page connected to the Instagram Professional account you want to automate.
                        </p>
                        
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {pendingPages.map((page: any) => (
                                <button
                                    key={page.id}
                                    onClick={() => selectPage(page.id, page.access_token)}
                                    className="w-full flex flex-col text-left p-4 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    <span className="font-semibold text-base">{page.name}</span>
                                    <span className="text-xs text-muted-foreground">{page.category} • ID: {page.id}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
