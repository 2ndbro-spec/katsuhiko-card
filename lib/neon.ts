import 'server-only'
import { neon } from '@neondatabase/serverless'

// ビルド時ではなくリクエスト時に初期化する
export function getDb() {
  return neon(process.env.NEON_DATABASE_URL!)
}
