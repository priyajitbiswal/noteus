# noteus

noteus is a real-time collaborative text editor built for a hackathon challenge. It allows multiple users to edit the same document simultaneously with instant synchronization, user presence, cursor awareness, conflict-free merging, and revision history.

## Problem Description

Build a real-time collaborative text editor where multiple users can edit the same document simultaneously, similar to Google Docs (simplified).

The core challenge is ensuring all user changes sync instantly and safely under concurrent edits, with robust conflict resolution.

## Key Features

- Real-time synchronization of text changes across multiple users
- User presence indicators showing who is online and editing
- Cursor position tracking per user (colored cursors)
- Conflict resolution for simultaneous edits in the same section
- Basic text formatting: bold, italic, underline
- Document persistence and revision history

## Tech Stack

### Frontend

- React (Vite)
- TipTap editor
- Yjs + y-websocket (collaborative editing and awareness)

### Backend

- Python (FastAPI)
- WebSocket endpoints for real-time communication

### Database

- PostgreSQL (Supabase)

### Collaboration Engine

- CRDT-based conflict resolution using Yjs

## Architecture Overview

The system follows a client-server architecture:

1. The React frontend renders the rich-text editor and captures user edits.
2. Each client connects to the backend using WebSockets.
3. Edits are encoded as CRDT updates (Yjs updates) and sent to the server.
4. The backend collaboration hub relays updates to all connected clients in the same document room.
5. Yjs merges concurrent updates deterministically, preventing edit conflicts.
6. Document snapshots and metadata are persisted to PostgreSQL.
7. Revision history enables users to review and restore previous document states.

High-level flow:

Frontend (React + TipTap + Yjs) <-> WebSocket API (FastAPI) <-> PostgreSQL (Supabase)

## Setup Instructions

## Prerequisites

- Node.js 18+
- Python 3.11+

Note: Supabase database setup is already completed for this project, so users do not need to create or configure a database during setup.

## 1) Clone and enter project

```bash
git clone <your-repository-url>
cd noteus
```

## 2) Backend setup

```bash
cd server
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn main:app --reload --port 8000
```

## 3) Frontend setup

```bash
cd ../client
npm install
```

Run frontend:

```bash
npm run dev
```

App should be available at `http://localhost:5173`.

## Technical Requirements Mapping

- WebSocket-based real-time communication: implemented via FastAPI WebSocket endpoints
- OT or CRDT: implemented with CRDT (Yjs)
- Backend with WebSocket support: Python + FastAPI
- Frontend with collaborative editing libraries: React + TipTap + Yjs
- Database for persistence: PostgreSQL (Supabase)

## Submission Requirements

- Live deployed URL: `<add-url>`
- GitHub repository: `<add-repo-link>`
- Video demo URL: `<add-youtube-or-drive-link>`

## Scoring Rubric Alignment

- Code Quality and Structure: modular client-server design, clean separation of collaboration/persistence/UI layers
- Features and Functionality: real-time sync, presence, cursor tracking, formatting, revisions
- Technical Implementation: WebSockets + CRDT merging for conflict-free collaboration
- User Experience and Design: responsive collaborative editor with live presence feedback

## AI Tools Used

- ChatGPT
- Google Antigravity

## Known Limitations

- No granular role-based permissions (for example, editor vs viewer) by default
- Revision history may be snapshot-based rather than full semantic diffs
- Presence and cursor rendering quality depends on network stability
- Offline-first behavior depends on client reconnect flow and may vary in edge cases
- Large documents and high concurrency may need additional performance tuning and load testing
- Authentication and authorization hardening may require additional production setup

## Security Notes

- Do not commit real `.env` files to public repositories
- Rotate secrets immediately if accidentally exposed
- Restrict CORS and database access in production deployments
