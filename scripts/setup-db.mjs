/**
 * Neon DB セットアップスクリプト
 * 実行: node --env-file=.env.local scripts/setup-db.mjs
 *
 * やること:
 *  1. pgvector 拡張を有効化
 *  2. public_chunks テーブルを作成
 *  3. HNSWインデックスを作成
 *  4. recency重み付き検索RPC関数を作成
 */

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.NEON_DATABASE_URL)

async function setup() {
  console.log('🔌 Neonに接続中...')

  // 1. pgvector 拡張
  console.log('📦 pgvector 拡張を有効化...')
  await sql`CREATE EXTENSION IF NOT EXISTS vector`
  console.log('  ✅ vector 拡張 OK')

  // 2. public_chunks テーブル
  console.log('🗄️  public_chunks テーブルを作成...')
  await sql`
    CREATE TABLE IF NOT EXISTS public_chunks (
      id               text PRIMARY KEY,
      source           text,
      path             text,
      title            text,
      date             timestamptz,
      role             text,
      concept          text,
      quadrant         text,
      axis_mind        text,
      axis_self        text,
      profile_relevant boolean,
      char_count       int,
      sha1             text,
      text             text,
      embedding        vector(1536)
    )
  `
  console.log('  ✅ public_chunks テーブル OK')

  // 3. インデックス
  console.log('🔍 インデックスを作成...')
  await sql`
    CREATE INDEX IF NOT EXISTS public_chunks_embedding_hnsw
    ON public_chunks USING hnsw (embedding vector_cosine_ops)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS public_chunks_date_idx
    ON public_chunks (date)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS public_chunks_concept_idx
    ON public_chunks (concept)
  `
  console.log('  ✅ インデックス OK')

  // 4. 検索RPC（recency重み付き）
  console.log('⚙️  検索RPC関数を作成...')
  await sql`
    CREATE OR REPLACE FUNCTION search_public_chunks(
      query_embedding  vector(1536),
      match_count      int     DEFAULT 5,
      filter_concept   text    DEFAULT NULL,
      filter_source    text    DEFAULT NULL,
      recency_weight   float   DEFAULT 0.3,
      date_from        timestamptz DEFAULT NULL
    )
    RETURNS TABLE (
      id          text,
      title       text,
      chunk_text  text,
      concept     text,
      source      text,
      date        timestamptz,
      similarity  float
    )
    LANGUAGE plpgsql
    AS $func$
    DECLARE
      min_date timestamptz;
      max_date timestamptz;
    BEGIN
      SELECT MIN(c.date), MAX(c.date)
        INTO min_date, max_date
        FROM public_chunks c
       WHERE c.embedding IS NOT NULL
         AND (filter_concept IS NULL OR c.concept = filter_concept)
         AND (filter_source  IS NULL OR c.source  = filter_source)
         AND (date_from      IS NULL OR c.date   >= date_from);

      RETURN QUERY
      SELECT
        c.id,
        c.title,
        c.text,
        c.concept,
        c.source,
        c.date,
        (
          (1 - (c.embedding <=> query_embedding)) *
          (1 + recency_weight *
            CASE
              WHEN max_date IS NULL OR max_date = min_date THEN 0.0
              ELSE EXTRACT(EPOCH FROM (c.date - min_date)) /
                   EXTRACT(EPOCH FROM (max_date - min_date))
            END
          )
        )::float AS similarity
      FROM public_chunks c
     WHERE c.embedding IS NOT NULL
       AND (filter_concept IS NULL OR c.concept = filter_concept)
       AND (filter_source  IS NULL OR c.source  = filter_source)
       AND (date_from      IS NULL OR c.date   >= date_from)
     ORDER BY similarity DESC
     LIMIT match_count;
    END;
    $func$
  `
  console.log('  ✅ search_public_chunks 関数 OK')

  // 確認
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `
  console.log('\n📋 作成済みテーブル:', tables.map(t => t.table_name))

  const funcs = await sql`
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
  `
  console.log('📋 作成済み関数:', funcs.map(f => f.routine_name))

  console.log('\n🎉 DBセットアップ完了！')
}

setup().catch(err => {
  console.error('❌ エラー:', err.message)
  process.exit(1)
})
