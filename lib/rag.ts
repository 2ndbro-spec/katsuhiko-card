import 'server-only'
import OpenAI from 'openai'
import { getDb } from './neon'

interface RagChunk {
  id: string
  title: string
  chunk_text: string
  concept: string
  source: string
  date: string
  similarity: number
}

/**
 * ユーザーの質問を埋め込み → Neon public_chunks をベクトル検索 → スニペット文字列を返す
 */
export async function searchRAG(query: string, matchCount = 5): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

  // 1. クエリを埋め込む
  const resp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const embedding = resp.data[0].embedding
  const embeddingStr = '[' + embedding.join(',') + ']'

  // 2. recency重み付きベクトル検索
  const sql = getDb()
  const results = (await sql`
    SELECT * FROM search_public_chunks(
      ${embeddingStr}::vector(1536),
      ${matchCount},
      NULL::text,
      NULL::text,
      0.3::float,
      NULL::timestamptz
    )
  `) as RagChunk[]

  if (!results.length) return ''

  // 3. スニペット形式に整形
  return results
    .map((r, i) => {
      const header = [r.title, r.concept, r.source].filter(Boolean).join(' / ')
      return `[参照${i + 1}] ${header}\n${r.chunk_text}`
    })
    .join('\n\n---\n\n')
}
