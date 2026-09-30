"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { useInstagramSession } from "@/hooks/use-instagram-session"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { username, profilePic, logout, isLoading, pendingPages, selectPage } = useInstagramSession()
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
