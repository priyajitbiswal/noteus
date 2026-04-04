import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'

import { useUserStore } from '../store/userStore'
import { useCollaboration } from '../hooks/useCollaboration'
import Toolbar from '../components/Toolbar'
import PresenceBar from '../components/PresenceBar'
import RevisionHistory from '../components/RevisionHistory'
import UserSetup from '../components/UserSetup'
import ThemeToggle from '../components/ThemeToggle'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Editor() {
  const { id: docId } = useParams()
  const user = useUserStore()
  const [docTitle, setDocTitle] = useState('Untitled Document')
  const [titleDraft, setTitleDraft] = useState('')
  const [revOpen, setRevOpen] = useState(false)
  const [docLoaded, setDocLoaded] = useState(false)
  const [shareToast, setShareToast] = useState(false)
  const titleSaveTimer = useRef(null)

  // Collaboration state (Yjs + WebSocket)
  const { ydoc, provider, status, awarenessUsers } = useCollaboration(
    docId,
    user.isSetup ? user : null
  )

  // Fetch document metadata
  useEffect(() => {
    fetch(`${API}/documents/${docId}`)
      .then(r => r.json())
      .then(data => {
        if (data?.title) { setDocTitle(data.title); setTitleDraft(data.title) }
        setDocLoaded(true)
      })
      .catch(() => setDocLoaded(true))
  }, [docId])

  // TipTap editor (only created once ydoc is ready)
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ history: false }),
        Underline,
        Highlight,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ...(ydoc && provider
          ? [
              Collaboration.configure({ document: ydoc }),
              CollaborationCursor.configure({
                provider,
                user: {
                  name: user.name,
                  color: user.color,
                },
              }),
            ]
          : []),
      ],
      editorProps: {
        attributes: {
          class: 'ProseMirror',
          spellcheck: 'true',
          'data-placeholder': 'Start writing… your changes sync instantly with all collaborators.',
        },
      },
    },
    [ydoc, provider]
  )

  // Save title with debounce
  const handleTitleChange = (e) => {
    setTitleDraft(e.target.value)
    clearTimeout(titleSaveTimer.current)
    titleSaveTimer.current = setTimeout(async () => {
      await fetch(`${API}/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: e.target.value || 'Untitled Document' }),
      })
      setDocTitle(e.target.value)
    }, 800)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setShareToast(true)
    setTimeout(() => setShareToast(false), 2500)
  }

  const handleExport = () => {
    if (!editor) return
    const text = editor.getText()
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${docTitle || 'document'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRestore = (htmlContent) => {
    if (editor) {
      editor.commands.setContent(htmlContent)
      setRevOpen(false)
    }
  }

  const wordCount = editor ? editor.getText().trim().split(/\s+/).filter(w => w.length > 0).length : 0
  const charCount = editor ? editor.getText().length : 0

  // Show user setup modal if not configured
  if (!user.isSetup) return <UserSetup />
  if (!docLoaded) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading document…</span>
    </div>
  )

  return (
    <div className="editor-page">
      {/* Top navigation bar */}
      <header className="editor-topbar">
        <Link to="/dashboard" className="btn btn-primary btn-sm" id="home-link" title="Return to Dashboard">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: -1 }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Dashboard
        </Link>

        <input
          id="doc-title-input"
          className="doc-title-input"
          value={titleDraft}
          onChange={handleTitleChange}
          placeholder="Untitled Document"
          aria-label="Document title"
        />
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
           {titleDraft !== docTitle ? 'Saving...' : ''}
        </span>

        <div className="topbar-actions">
          <div
            className={`connection-dot ${status}`}
            title={status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting…' : 'Disconnected'}
          />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {status === 'connected' ? 'Live' : status === 'connecting' ? 'Syncing…' : 'Offline'}
          </span>

          <button className="btn btn-sm" onClick={handleExport} style={{ marginRight: 8 }} title="Download as text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          
          <button className="btn btn-primary btn-sm" onClick={handleShare} style={{ marginRight: 8 }} title="Copy Share Link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4}}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>

          <button
            id="revision-history-btn"
            className="btn btn-sm"
            style={{ marginRight: 8 }}
            onClick={() => setRevOpen(v => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4}}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            History
          </button>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Formatting toolbar */}
      <Toolbar editor={editor} />

      {/* Main editor area */}
      <div className="editor-body">
        <div className="editor-scroll">
          <article className="editor-paper">
            {editor ? (
              <EditorContent editor={editor} />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            )}
          </article>
        </div>

        {/* Live presence sidebar */}
        <PresenceBar users={awarenessUsers} />
      </div>

      {/* Live word and character counter */}
      <div style={{ position: 'fixed', bottom: 24, left: 24, background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 'var(--radius-xl)', fontSize: 13, color: 'var(--text-muted)', boxShadow: 'var(--shadow-sm)', zIndex: 50, display: 'flex', gap: 12 }}>
        <span><strong style={{ color: 'var(--text-primary)' }}>{wordCount}</strong> words</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>{charCount}</strong> chars</span>
      </div>

      {/* Share Toast Notification */}
      <div style={{ 
        position: 'fixed', bottom: 24, right: 24, zIndex: 1000, 
        background: 'var(--accent)', color: '#fff', padding: '12px 24px', 
        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        opacity: shareToast ? 1 : 0, 
        transform: shareToast ? 'translateY(0)' : 'translateY(20px)', 
        pointerEvents: shareToast ? 'all' : 'none',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        Share link copied!
      </div>

      {/* Revision history slide-in drawer */}
      <RevisionHistory
        docId={docId}
        open={revOpen}
        onClose={() => setRevOpen(false)}
        user={user}
        onRestore={handleRestore}
      />
    </div>
  )
}
