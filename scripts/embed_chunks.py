"""
埋め込みバッチスクリプト  chunks.jsonl → Neon public_chunks
実行: python3 scripts/embed_chunks.py

やること:
  1. chunks.jsonl を読み込み §7 フィルタを適用
  2. Neon に既存の sha1 を問い合わせ差分のみ処理
  3. OpenAI text-embedding-3-small でバッチ埋め込み
  4. Neon の public_chunks に upsert
"""

import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
import psycopg2
import psycopg2.extras
from tqdm import tqdm

# ─── 設定 ────────────────────────────────────────────
load_dotenv(Path(__file__).parent.parent / ".env.local")

CHUNKS_PATH   = Path.home() / "Desktop" / "Obsidian_RAG" / "chunks.jsonl"
EMBED_MODEL   = "text-embedding-3-small"
BATCH_SIZE    = 100     # OpenAI へ一度に送る件数
DB_BATCH_SIZE = 200     # Neon への一括 insert 件数
RECENCY_DATE  = "2026-01-01"  # これ以降を優先（メタとして保持）

# §7 公開レイヤーに入れる concept
PUBLIC_CONCEPTS = {
    "クライアントワーク",
    "戦略・分析・設計",
    "市場・競合理解",
    "コンテンツ・発信",
    "営業・商談",
    "ツール・技術習得",
}

# ─── クライアント初期化 ────────────────────────────────
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
db_url = os.environ["NEON_DATABASE_URL"]


def load_and_filter() -> list[dict]:
    """chunks.jsonl を読み込んで公開フィルタを適用する"""
    chunks = []
    with open(CHUNKS_PATH, encoding="utf-8") as f:
        for line in f:
            d = json.loads(line)
            if d.get("concept") in PUBLIC_CONCEPTS and not d.get("profile_relevant"):
                chunks.append(d)
    return chunks


def get_existing_sha1s(conn) -> set[str]:
    """Neon にすでに埋め込み済みの sha1 セットを返す"""
    with conn.cursor() as cur:
        cur.execute("SELECT sha1 FROM public_chunks WHERE embedding IS NOT NULL")
        return {row[0] for row in cur.fetchall()}


def embed_texts(texts: list[str]) -> list[list[float]]:
    """OpenAI でテキストリストを埋め込む（リトライ付き）"""
    for attempt in range(3):
        try:
            resp = openai_client.embeddings.create(
                model=EMBED_MODEL,
                input=texts,
            )
            return [item.embedding for item in resp.data]
        except Exception as e:
            if attempt == 2:
                raise
            wait = 2 ** attempt * 5
            print(f"\n  ⚠️  API エラー ({e}), {wait}s 待機後リトライ...")
            time.sleep(wait)


def upsert_batch(conn, rows: list[dict]):
    """public_chunks に一括 upsert する"""
    sql = """
        INSERT INTO public_chunks
          (id, source, path, title, date, role, concept, quadrant,
           axis_mind, axis_self, profile_relevant, char_count, sha1, text, embedding)
        VALUES %s
        ON CONFLICT (id) DO UPDATE SET
          embedding        = EXCLUDED.embedding,
          sha1             = EXCLUDED.sha1,
          text             = EXCLUDED.text,
          date             = EXCLUDED.date,
          concept          = EXCLUDED.concept,
          profile_relevant = EXCLUDED.profile_relevant
    """
    values = [
        (
            r["id"],
            r.get("source"),
            r.get("path"),
            r.get("title"),
            r.get("date") or None,
            r.get("role"),
            r.get("concept"),
            r.get("quadrant"),
            r.get("axis_mind"),
            r.get("axis_self"),
            r.get("profile_relevant"),
            r.get("char_count"),
            r.get("sha1"),
            r.get("text"),
            r["embedding"],
        )
        for r in rows
    ]
    with conn.cursor() as cur:
        psycopg2.extras.execute_values(cur, sql, values)
    conn.commit()


def main():
    print("📂 chunks.jsonl を読み込み中...")
    all_chunks = load_and_filter()
    print(f"  ✅ フィルタ通過: {len(all_chunks):,} 件")

    print("🔌 Neon に接続中...")
    conn = psycopg2.connect(db_url)

    existing = get_existing_sha1s(conn)
    print(f"  ℹ️  埋め込み済み: {len(existing):,} 件（スキップ）")

    # 差分のみ処理
    new_chunks = [c for c in all_chunks if c.get("sha1") not in existing]
    print(f"  🆕 新規処理対象: {len(new_chunks):,} 件\n")

    if not new_chunks:
        print("✨ 追加対象なし。完了。")
        conn.close()
        return

    # 埋め込み → upsert をバッチで実行
    buffer = []
    total_batches = (len(new_chunks) + BATCH_SIZE - 1) // BATCH_SIZE

    with tqdm(total=len(new_chunks), desc="埋め込み中", unit="件") as pbar:
        for i in range(0, len(new_chunks), BATCH_SIZE):
            batch = new_chunks[i : i + BATCH_SIZE]
            texts = [c["text"] for c in batch]

            embeddings = embed_texts(texts)

            for chunk, emb in zip(batch, embeddings):
                chunk["embedding"] = "[" + ",".join(map(str, emb)) + "]"
                buffer.append(chunk)

            # DB への書き込み
            if len(buffer) >= DB_BATCH_SIZE:
                upsert_batch(conn, buffer)
                buffer = []

            pbar.update(len(batch))

    # 残りを flush
    if buffer:
        upsert_batch(conn, buffer)

    # 最終確認
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM public_chunks WHERE embedding IS NOT NULL")
        total_in_db = cur.fetchone()[0]

    conn.close()
    print(f"\n🎉 完了！ public_chunks の総件数: {total_in_db:,} 件")


if __name__ == "__main__":
    main()
