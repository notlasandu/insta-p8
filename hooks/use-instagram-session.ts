"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

const consumedCodes = new Set<string>()

export function useInstagramSession() {
    const [username, setUsername] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [profilePic, setProfilePic] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isConnected, setIsConnected] = useState(true)
    const [pendingPages, setPendingPages] = useState<any[] | null>(null)

    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const code = searchParams.get("code")

        const handleSession = async () => {
            // CASE A: New Login from Facebook
            if (code) {
                if (consumedCodes.has(code)) {
                    const savedId = localStorage.getItem("ig_user_id")
                    const savedName = localStorage.getItem("ig_username")
                    if (savedId && savedName) {
                        setUserId(savedId)
                        setUsername(savedName)
                        setProfilePic(localStorage.getItem("ig_profile_pic"))
                        setIsConnected(true)
                        
                        const savedPages = sessionStorage.getItem("pending_pages")
                        if (savedPages) setPendingPages(JSON.parse(savedPages))
                    }
                    setIsLoading(false)
                    return
                }
                consumedCodes.add(code)

                try {
                    const res = await fetch("/api/instagram/callback", {
                        method: "POST",
                        body: JSON.stringify({ code }),
                    })
                    const data = await res.json()

                    if (data.success) {
                        localStorage.setItem("ig_user_id", data.userId)
                        localStorage.setItem("ig_username", data.username)
                        if (data.profilePic) localStorage.setItem("ig_profile_pic", data.profilePic)

                        setUserId(data.userId)
                        setUsername(data.username)
                        setProfilePic(data.profilePic || null)
                        setIsConnected(true)
                        
                        router.replace("/dashboard")
                        
                        if (data.pages && data.pages.length > 0) {
                            setPendingPages(data.pages)
                            sessionStorage.setItem("pending_pages", JSON.stringify(data.pages))
                        }
                    } else {
                        setIsConnected(false)
                    }
                } catch (err) {
                    console.error("Login failed:", err)
                    setIsConnected(false)
                }
            }
            // CASE B: Restore Session from LocalStorage or Supabase
            else {
                const savedId = localStorage.getItem("ig_user_id")
                const savedName = localStorage.getItem("ig_username")

                if (savedId && savedName) {
                    setUserId(savedId)
                    setUsername(savedName)
                    setProfilePic(localStorage.getItem("ig_profile_pic"))
                    setIsConnected(true)
                }

                try {
                    const res = await fetch("/api/auth/session")
                    const sessionData = await res.json()

                    if (sessionData?.connected && sessionData?.user) {
                        setUserId(sessionData.user.id)
                        setUsername(sessionData.user.username)
                        localStorage.setItem("ig_user_id", sessionData.user.id)
                        localStorage.setItem("ig_username", sessionData.user.username)
                        setIsConnected(true)
                    } else {
                        if (!savedId) setIsConnected(false)
                    }
                } catch {
                    if (!savedId) setIsConnected(false)
                }
            }
            setIsLoading(false)
        }

        handleSession()
    }, [searchParams, router])

    const selectPage = async (pageId: string, pageAccessToken: string) => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/instagram/save-page", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pageId, pageAccessToken }),
            })
            const data = await res.json()
            if (data.success) {
                setPendingPages(null)
                setIsConnected(true)
                sessionStorage.removeItem("pending_pages")
                router.replace("/dashboard")
            } else {
                console.error("Failed to save page:", data.error)
            }
        } catch (err) {
            console.error("Error saving page:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const logout = async () => {
        try {
            await fetch("/api/auth/gate", { method: "DELETE" })
        } catch {}
        localStorage.removeItem("ig_user_id")
        localStorage.removeItem("ig_username")
        localStorage.removeItem("ig_profile_pic")
        document.cookie = "insta_session=; Max-Age=0; path=/;"
        document.cookie = "dashboard_gate_session=; Max-Age=0; path=/;"
        setUsername(null)
        setUserId(null)
        setProfilePic(null)
        setIsConnected(false)
        router.push("/gate")
    }

    return { userId, username, profilePic, isLoading, isConnected, logout, pendingPages, selectPage }
}
