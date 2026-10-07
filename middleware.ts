import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyGateToken } from "@/lib/gate-auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/" || pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("dashboard_gate_session")?.value
    const isValid = await verifyGateToken(sessionCookie)

    if (!isValid) {
      const gateUrl = new URL("/gate", request.url)
      gateUrl.searchParams.set("redirect", pathname === "/" ? "/dashboard" : pathname + request.nextUrl.search)
      return NextResponse.redirect(gateUrl)
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
}
