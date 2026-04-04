"""FastAPI application — REST API + WebSocket endpoint."""

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

import database as db
from models import (
    DocumentCreate,
    DocumentOut,
    DocumentDetail,
    TitleUpdate,
    RevisionOut,
    RevisionCreate,
)
from ws_hub import hub

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Do not block startup on database readiness; connect lazily on first request.
    logger.info("Skipping DB warm-up at startup; pool will initialize lazily")
    yield
    await db.close_pool()


app = FastAPI(
    title="CollabEdit API",
    version="1.0.0",
    lifespan=lifespan,
)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ──────────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"status": "ok"}


# ── Documents ────────────────────────────────────────────────────────────────


@app.get("/documents", response_model=list[DocumentOut])
async def list_documents():
    return await db.list_documents()


@app.post("/documents", response_model=DocumentOut, status_code=201)
async def create_document(body: DocumentCreate):
    return await db.create_document(body.title)


@app.get("/documents/{doc_id}", response_model=DocumentDetail)
async def get_document(doc_id: str):
    doc = await db.get_document(doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


@app.patch("/documents/{doc_id}", response_model=DocumentOut)
async def update_title(doc_id: str, body: TitleUpdate):
    doc = await db.get_document(doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    await db.update_document_title(doc_id, body.title)
    doc = await db.get_document(doc_id)
    return doc


@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    doc = await db.get_document(doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    await db.delete_document(doc_id)
    return {"status": "deleted"}


# ── Revisions ────────────────────────────────────────────────────────────────


@app.get("/documents/{doc_id}/revisions", response_model=list[RevisionOut])
async def list_revisions(doc_id: str):
    return await db.list_revisions(doc_id)


@app.post("/documents/{doc_id}/revisions", response_model=RevisionOut, status_code=201)
async def create_revision(doc_id: str, body: RevisionCreate):
    # Grab current Yjs state from the in-memory hub (or DB fallback)
    from ws_hub import hub as _hub

    async with _hub._lock:
        room = _hub._rooms.get(doc_id)
    if room:
        snapshot = room.full_update()
    else:
        snapshot = await db.get_doc_state(doc_id)
    if not snapshot:
        raise HTTPException(400, "No document state available")
    return await db.save_revision(doc_id, snapshot, body.author, body.description)


@app.get("/revisions/{revision_id}")
async def get_revision(revision_id: str):
    rev = await db.get_revision(revision_id)
    if not rev:
        raise HTTPException(404, "Revision not found")
    # Return snapshot as base64 for the frontend to decode
    import base64

    snapshot_b64 = base64.b64encode(rev["ydoc_snapshot"]).decode()
    return {
        "id": rev["id"],
        "doc_id": rev["doc_id"],
        "author": rev["author"],
        "description": rev["description"],
        "created_at": rev["created_at"],
        "snapshot_b64": snapshot_b64,
    }


@app.delete("/revisions/{revision_id}")
async def delete_revision_route(revision_id: str):
    rev = await db.get_revision(revision_id)
    if not rev:
        raise HTTPException(404, "Revision not found")
    await db.delete_revision(revision_id)
    return {"status": "deleted"}


# ── WebSocket ────────────────────────────────────────────────────────────────


@app.websocket("/ws/{doc_id}")
async def websocket_endpoint(websocket: WebSocket, doc_id: str):
    await websocket.accept()
    try:
        await hub.handle(websocket, doc_id)
    except WebSocketDisconnect:
        pass


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
