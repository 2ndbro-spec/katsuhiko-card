'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { encrypt, decrypt } from '@/lib/session'
import { createEntry, updateEntry, deleteEntry } from '@/lib/knowledge'

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

export async function createEntryAction(formData: FormData) {
  if (!(await verifySession())) redirect('/login')

  const title = formData.get('title')?.toString().trim() ?? ''
  const content = formData.get('content')?.toString().trim() ?? ''
  if (!title || !content) return

  await createEntry(title, content)
  redirect('/admin')
}

export async function updateEntryAction(formData: FormData) {
  if (!(await verifySession())) redirect('/login')

  const id = formData.get('id')?.toString() ?? ''
  const title = formData.get('title')?.toString().trim() ?? ''
  const content = formData.get('content')?.toString().trim() ?? ''
  if (!id || !title || !content) return

  await updateEntry(id, title, content)
  redirect('/admin')
}

export async function deleteEntryAction(formData: FormData) {
  if (!(await verifySession())) redirect('/login')

  const id = formData.get('id')?.toString() ?? ''
  if (!id) return

  await deleteEntry(id)
  redirect('/admin')
}
