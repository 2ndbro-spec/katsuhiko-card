import 'server-only'
import { SignJWT, jwtVerify } from 'jose'

const key = new TextEncoder().encode(process.env.AUTH_SECRET!)

export async function encrypt(payload: { authenticated: boolean }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function decrypt(token: string): Promise<{ authenticated: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    return payload as { authenticated: boolean }
  } catch {
    return null
  }
}
