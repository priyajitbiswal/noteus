"""Database layer — asyncpg + Supabase PostgreSQL."""

import asyncpg
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.environ["DATABASE_URL"],
            min_size=2,
            max_size=10,
            command_timeout=30,
        )
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


# ── Documents ───────────────────────────────────────────────────────────────

async def list_documents() -> list[dict]:
    pool = await get_pool()
    rows = await pool.fetch(
        "SELECT id::text, title, created_at, updated_at FROM documents ORDER BY updated_at DESC"
    )
    return [dict(r) for r in rows]


async def create_document(title: str) -> dict:
    pool = await get_pool()
    row = await pool.fetchrow(
        "INSERT INTO documents (title) VALUES ($1) RETURNING id::text, title, created_at, updated_at",
        title,
    )
    return dict(row)


async def get_document(doc_id: str) -> Optional[dict]:
    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT id::text, title, ydoc_state, created_at, updated_at FROM documents WHERE id=$1::uuid",
        doc_id,
    )
    return dict(row) if row else None


async def update_document_title(doc_id: str, title: str):
    pool = await get_pool()
    await pool.execute(
        "UPDATE documents SET title=$1 WHERE id=$2::uuid",
        title, doc_id,
    )


async def save_doc_state(doc_id: str, state: bytes):
    pool = await get_pool()
    await pool.execute(
        "UPDATE documents SET ydoc_state=$1 WHERE id=$2::uuid",
        state, doc_id,
    )


async def get_doc_state(doc_id: str) -> Optional[bytes]:
    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT ydoc_state FROM documents WHERE id=$1::uuid",
        doc_id,
    )
    if row and row["ydoc_state"]:
        return bytes(row["ydoc_state"])
    return None


async def delete_document(doc_id: str):
    pool = await get_pool()
    await pool.execute(
        "DELETE FROM documents WHERE id=$1::uuid",
        doc_id,
    )


# ── Revisions ───────────────────────────────────────────────────────────────

async def save_revision(doc_id: str, snapshot: bytes, author: str = "", description: str = "") -> dict:
    pool = await get_pool()
    row = await pool.fetchrow(
        """INSERT INTO revisions (doc_id, ydoc_snapshot, author, description)
           VALUES ($1::uuid, $2, $3, $4)
           RETURNING id::text, doc_id::text, author, description, created_at""",
        doc_id, snapshot, author, description,
    )
    return dict(row)


async def list_revisions(doc_id: str) -> list[dict]:
    pool = await get_pool()
    rows = await pool.fetch(
        """SELECT id::text, doc_id::text, author, description, created_at
           FROM revisions WHERE doc_id=$1::uuid ORDER BY created_at DESC LIMIT 50""",
        doc_id,
    )
    return [dict(r) for r in rows]


async def get_revision(revision_id: str) -> Optional[dict]:
    pool = await get_pool()
    row = await pool.fetchrow(
        "SELECT id::text, doc_id::text, ydoc_snapshot, author, description, created_at FROM revisions WHERE id=$1::uuid",
        revision_id,
    )
    return dict(row) if row else None

async def delete_revision(revision_id: str):
    pool = await get_pool()
    await pool.execute(
        "DELETE FROM revisions WHERE id=$1::uuid",
        revision_id,
    )
