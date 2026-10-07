"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, KeyRound, Loader2, ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function GatePage() {
  const [passcode, setPasscode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/dashboard"

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.replace(redirectPath)
      } else {
        setError(data.error || "Incorrect passcode")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl transition-all">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Protected Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Please enter the access passcode to view this dashboard.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-1.5">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value)
                  if (error) setError(null)
                }}
                autoFocus
                className="pl-9 text-center text-lg tracking-widest"
              />
            </div>
            {error && (
              <p className="text-center text-xs font-medium text-destructive animate-in fade-in">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading || !passcode.trim()} className="w-full gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Unlock Dashboard <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Passcode persists for 30 days once unlocked</span>
        </div>
      </div>
    </div>
  )
}
