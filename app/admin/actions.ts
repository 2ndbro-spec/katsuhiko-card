'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { encrypt, decrypt } from '@/lib/session'

async function verifySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-session')?.value
  if (!token) return false
  const session = await decrypt(token)
  return session?.authenticated === true
}

export async function loginAction(formData: FormData) {
  const password = formData.get('password')?.toString() ?? ''
  const expected = process.env.ADMIN_PASSWORD ?? ''

  const passwordBuffer = Buffer.from(password)
  const expectedBuffer = Buffer.from(expected)

  let match = false
  if (passwordBuffer.length === expectedBuffer.length) {
    const { timingSafeEqual } = await import('crypto')
    match = timingSafeEqual(passwordBuffer, expectedBuffer)
  }

  if (!match) {
    redirect('/login?error=1')
  }

  const token = await encrypt({ authenticated: true })
  const cookieStore = await cookies()
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
  redirect('/login')
}
