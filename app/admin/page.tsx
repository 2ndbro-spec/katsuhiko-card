import { fetchAllEntries, KnowledgeEntry } from '@/lib/knowledge'
import {
  logoutAction,
  createEntryAction,
  updateEntryAction,
  deleteEntryAction,
} from './actions'

export default async function AdminPage() {
  const entries = await fetchAllEntries()

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">ナレッジ管理</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            ログアウト
          </button>
        </form>
      </div>

      {/* 新規追加フォーム */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-gray-400 mb-3">新規追加</h2>
        <form action={createEntryAction} className="flex flex-col gap-3">
          <input
            type="text"
            name="title"
            placeholder="タイトル（例：最近の活動、得意分野）"
            required
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-500"
          />
          <textarea
            name="content"
            placeholder="内容"
            required
            rows={4}
            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-500 resize-none"
          />
          <button
            type="submit"
            className="self-end bg-white text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            追加
          </button>
        </form>
      </section>

      {/* ナレッジ一覧 */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 mb-3">
          登録済み（{entries.length}件）
        </h2>
        {entries.length === 0 ? (
          <p className="text-gray-600 text-sm">まだナレッジがありません。</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {entries.map((entry: KnowledgeEntry) => (
              <EntryItem key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

function EntryItem({ entry }: { entry: KnowledgeEntry }) {
  return (
    <li className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
      <details>
        <summary className="cursor-pointer font-medium text-sm select-none">
          {entry.title}
        </summary>
        <div className="mt-4 flex flex-col gap-3">
          {/* 編集フォーム */}
          <form action={updateEntryAction} className="flex flex-col gap-3">
            <input type="hidden" name="id" value={entry.id} />
            <input
              type="text"
              name="title"
              defaultValue={entry.title}
              required
              className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
            />
            <textarea
              name="content"
              defaultValue={entry.content}
              required
              rows={4}
              className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500 resize-none"
            />
            <button
              type="submit"
              className="self-end text-sm bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded-lg transition-colors"
            >
              保存
            </button>
          </form>

          {/* 削除フォーム */}
          <form action={deleteEntryAction}>
            <input type="hidden" name="id" value={entry.id} />
            <button
              type="submit"
              className="text-red-400 text-xs hover:text-red-300 transition-colors"
            >
              削除
            </button>
          </form>
        </div>
      </details>
    </li>
  )
}
