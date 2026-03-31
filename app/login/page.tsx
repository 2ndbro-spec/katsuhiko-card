import { loginAction } from '@/app/admin/actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-xl font-semibold mb-8 text-center">管理ページ</h1>
        <form action={loginAction} className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            placeholder="パスワード"
            required
            className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-500"
          />
          {error && (
            <p className="text-red-400 text-sm text-center">パスワードが正しくありません</p>
          )}
          <button
            type="submit"
            className="w-full bg-white text-black rounded-lg px-4 py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            ログイン
          </button>
        </form>
      </div>
    </main>
  )
}
