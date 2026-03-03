'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth'

export async function loginAction(email: string, password: string, pin: string) {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminPin = process.env.ADMIN_PIN

  if (!adminEmail || !adminPassword || !adminPin) {
    return { error: 'Server configuration error' }
  }

  if (email !== adminEmail || password !== adminPassword || pin !== adminPin) {
    return { error: 'Invalid credentials' }
  }

  const token = createSessionToken()
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  })

  return { success: true }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  redirect('/login')
}
