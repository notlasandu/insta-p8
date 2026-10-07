import { NextRequest, NextResponse } from "next/server"
import { getExpectedPasscode, hashPasscode } from "@/lib/gate-auth"

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json()
    const expected = getExpectedPasscode()

    if (!passcode || passcode.trim() !== expected.trim()) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 })
    }

    const token = await hashPasscode(passcode.trim())
    const res = NextResponse.json({ success: true })

    res.cookies.set("dashboard_gate_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return res
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete("dashboard_gate_session")
  return res
}
