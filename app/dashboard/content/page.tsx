"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function ContentStudioPage() {
  const [loading, setLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const contentBaseUrl =
    process.env.NEXT_PUBLIC_CONTENT_MANAGER_URL || "http://localhost:5173"

  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: "THEME_CHANGE", theme: resolvedTheme }, "*")
    }
  }, [resolvedTheme])

  const handleIframeLoad = () => {
    setLoading(false)
    const iframe = iframeRef.current
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: "THEME_CHANGE", theme: resolvedTheme }, "*")
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading Content Studio...</p>
        </div>
      )}
      <iframe
        key={resolvedTheme}
        ref={iframeRef}
        src={`${contentBaseUrl}/a/berl_view?theme=${resolvedTheme}`}
        title="Content Manager Studio"
        onLoad={handleIframeLoad}
        className="h-full w-full border-0 outline-none"
        allow="clipboard-write; camera; microphone"
      />
    </div>
  )
}
