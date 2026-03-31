import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('admin-session')?.value
  const session = token ? await decrypt(token) : null

  if (!session?.authenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
