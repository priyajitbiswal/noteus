"""
WebSocket hub — manages rooms, Yjs sync protocol, awareness relay.

Protocol flow when a client connects:
  1. Server → Client : SYNC_STEP1 (server state vector)
  2. Client → Server : SYNC_STEP1 (client state vector)
  3. Server → Client : SYNC_STEP2 (diff: what client is missing)
  4. Client → Server : SYNC_STEP2 (diff: what server is missing) [server applies]
  5. Client → Server : UPDATE (on every local change)              [server applies + broadcasts]
  6. Client → Server : AWARENESS (cursor/presence)                 [server broadcasts]
"""

import asyncio
import logging
from typing import Dict, Optional, Set

from fastapi import WebSocket
from pycrdt import Doc

import database as db
from protocol import (
    SYNC_STEP1, SYNC_STEP2, SYNC_UPDATE,
    make_sync_step1, make_sync_step2,
    parse_messages,
)

logger = logging.getLogger(__name__)

SAVE_INTERVAL = 30   # seconds between periodic saves


class Connection:
    def __init__(self, websocket: WebSocket):
        self.ws = websocket
        self.last_awareness: Optional[bytes] = None

    async def send(self, data: bytes):
        try:
            await self.ws.send_bytes(data)
        except Exception:
            pass


class Room:
    def __init__(self, doc_id: str):
        self.doc_id = doc_id
        self.doc = Doc()
        self.connections: Set[Connection] = set()
        self._lock = asyncio.Lock()
        self.dirty = False
        self._save_task: Optional[asyncio.Task] = None

    # ── Yjs helpers ────────────────────────────────────────────────────────

    def state_vector(self) -> bytes:
        try:
            return bytes(self.doc.get_state_vector())
        except Exception:
            return b""

    def full_update(self) -> bytes:
        try:
            return bytes(self.doc.get_update())
        except Exception:
            return b""

    def diff_update(self, client_sv: bytes) -> bytes:
        try:
            return bytes(self.doc.get_update(client_sv))
        except Exception:
            return self.full_update()

    def apply(self, update: bytes):
        try:
            self.doc.apply_update(update)
            self.dirty = True
        except Exception as e:
            logger.warning(f"[{self.doc_id}] apply_update error: {e}")

    # ── Broadcast helpers ──────────────────────────────────────────────────

    async def broadcast(self, data: bytes, exclude: Optional[Connection] = None):
        dead = set()
        for conn in self.connections:
            if conn is exclude:
                continue
            try:
                await conn.ws.send_bytes(data)
            except Exception:
                dead.add(conn)
        self.connections -= dead

    # ── Periodic save ──────────────────────────────────────────────────────

    async def _periodic_save(self):
        while True:
            await asyncio.sleep(SAVE_INTERVAL)
            if self.dirty:
                await self._flush()

    async def _flush(self):
        try:
            state = self.full_update()
            if state:
                await db.save_doc_state(self.doc_id, state)
                self.dirty = False
        except Exception as e:
            logger.error(f"[{self.doc_id}] flush error: {e}")


class CollabHub:
    def __init__(self):
        self._rooms: Dict[str, Room] = {}
        self._lock = asyncio.Lock()

    async def _get_room(self, doc_id: str) -> Room:
        async with self._lock:
            if doc_id not in self._rooms:
                room = Room(doc_id)
                # Load persisted state
                try:
                    state = await db.get_doc_state(doc_id)
                    if state:
                        room.apply(state)
                        room.dirty = False
                except Exception as e:
                    logger.error(f"[{doc_id}] load state error: {e}")
                self._rooms[doc_id] = room
            return self._rooms[doc_id]

    async def _release_room(self, doc_id: str, room: Room):
        if not room.connections:
            if room.dirty:
                await room._flush()
            if room._save_task:
                room._save_task.cancel()
            async with self._lock:
                self._rooms.pop(doc_id, None)

    # ── Main connection handler ────────────────────────────────────────────

    async def handle(self, websocket: WebSocket, doc_id: str):
        room = await self._get_room(doc_id)
        conn = Connection(websocket)
        room.connections.add(conn)

        # Start periodic save if first connection
        if room._save_task is None or room._save_task.done():
            room._save_task = asyncio.create_task(room._periodic_save())

        # --- Handshake: send server state vector so client can sync us ---
        sv = room.state_vector()
        await conn.send(make_sync_step1(sv))

        # --- Send current awareness of all peers ---
        for other in room.connections:
            if other is not conn and other.last_awareness:
                from protocol import make_awareness_msg
                await conn.send(make_awareness_msg(other.last_awareness))

        try:
            async for raw in websocket.iter_bytes():
                await self._dispatch(raw, conn, room)
        except Exception as e:
            logger.debug(f"[{doc_id}] connection closed: {e}")
        finally:
            room.connections.discard(conn)
            await self._release_room(doc_id, room)

    async def _dispatch(self, data: bytes, conn: Connection, room: Room):
        # We process ALL concatenated messages in the binary frame
        for msg in parse_messages(data):
            if msg["type"] == "sync":
                step, content = msg["step"], msg["content"]

                if step == SYNC_STEP1:
                    # Client sends its SV → we reply with what it's missing
                    diff = room.diff_update(content)
                    await conn.send(make_sync_step2(diff))

                elif step == SYNC_STEP2:
                    # Client sends updates we were missing
                    if content:
                        async with room._lock:
                            room.apply(content)
                        await room.broadcast(data, exclude=conn)

                elif step == SYNC_UPDATE:
                    # Regular edit update
                    if content:
                        async with room._lock:
                            room.apply(content)
                        await room.broadcast(data, exclude=conn)

            elif msg["type"] == "awareness":
                conn.last_awareness = msg["content"]
                await room.broadcast(data, exclude=conn)

hub = CollabHub()
