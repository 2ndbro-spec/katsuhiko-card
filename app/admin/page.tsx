export const dynamic = 'force-dynamic'

import { logoutAction } from './actions'
import { getDb } from '@/lib/neon'

async function getChunkCount(): Promise<number> {
  try {
    const sql = getDb()
    const result = await sql`SELECT COUNT(*)::int AS cnt FROM public_chunks`
    return result[0]?.cnt ?? 0
  } catch {
    return -1
  }
}

export default async function AdminPage() {
  const count = await getChunkCount()

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">管理ダッシュボード</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            ログアウト
          </button>
        </form>
      </div>

      <section className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 flex flex-col gap-4">
        <h2 className="text-sm font-medium text-gray-400">RAGシステム</h2>
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm">稼働中（Neon + OpenAI text-embedding-3-small）</span>
        </div>
        <p className="text-3xl font-bold">
          {count >= 0 ? count.toLocaleString() : '—'}
          <span className="text-base font-normal text-gray-400 ml-2">チャンク</span>
        </p>
        <p className="text-xs text-gray-500">
          Obsidian Vault の公開チャンクを埋め込み済み。更新は
          <code className="mx-1 text-gray-300">scripts/embed_chunks.py</code>
          を再実行してください。
        </p>
      </section>
    </main>
  )
}
