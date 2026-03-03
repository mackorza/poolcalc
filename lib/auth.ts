import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE_NAME = 'poolcalc_session'
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET not set')
  return secret
}

export function createSessionToken(): string {
  const timestamp = Date.now().toString()
  const signature = createHmac('sha256', getSecret())
    .update(timestamp)
    .digest('hex')
  return `${timestamp}.${signature}`
}

export function verifySessionToken(token: string): boolean {
  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [timestamp, signature] = parts
  const expectedSignature = createHmac('sha256', getSecret())
    .update(timestamp)
    .digest('hex')

  if (signature !== expectedSignature) return false

  const tokenAge = Date.now() - parseInt(timestamp, 10)
  if (tokenAge > SESSION_EXPIRY_MS) return false

  return true
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return false
  return verifySessionToken(token)
}
