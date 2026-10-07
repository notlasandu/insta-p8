const DEFAULT_PASSCODE = "admin123"

export function getExpectedPasscode(): string {
  return process.env.DASHBOARD_PASSCODE || DEFAULT_PASSCODE
}

export async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${passcode}:salt:${getExpectedPasscode()}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyGateToken(token?: string | null): Promise<boolean> {
  if (!token) return false
  const expectedToken = await hashPasscode(getExpectedPasscode())
  return token === expectedToken
}
