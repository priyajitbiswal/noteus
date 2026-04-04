import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import RevisionViewer from './RevisionViewer'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function RevisionHistory({ docId, open, onClose, user, onRestore }) {
  const [revisions, setRevisions] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [desc, setDesc] = useState('')
  const [selectedRevision, setSelectedRevision] = useState(null)
  const [fetchingRev, setFetchingRev] = useState(null)
  const [instantRestoreMode, setInstantRestoreMode] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`${API}/documents/${docId}/revisions`)
      .then(r => r.json())
      .then(data => { setRevisions(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open, docId])

  const saveRevision = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API}/documents/${docId}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: user?.name || 'Anonymous', description: desc }),
      })
      if (res.ok) {
        const rev = await res.json()
        setRevisions(prev => [rev, ...prev])
        setDesc('')
        showToast('Revision saved!')
      }
    } finally {
      setSaving(false)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleInstantRestore = async (e, revId) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to instantly restore this version? This will overwrite the live document!")) return
    setFetchingRev(revId)
    try {
      const res = await fetch(`${API}/revisions/${revId}`)
      if (res.ok) {
        const fullRev = await res.json()
        setInstantRestoreMode(true)
        setSelectedRevision(fullRev)
      }
    } catch(err) {
      console.error(err)
    } finally {
      setFetchingRev(null)
    }
  }

  const handleRevisionClick = async (revId) => {
    setFetchingRev(revId)
    try {
      const res = await fetch(`${API}/revisions/${revId}`)
      if (res.ok) {
        const fullRev = await res.json()
        setSelectedRevision(fullRev)
      }
    } catch(err) {
      console.error(err)
    } finally {
      setFetchingRev(null)
    }
  }

  const handleDelete = async (e, revId) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to permanently delete this revision?")) return
    try {
      const res = await fetch(`${API}/revisions/${revId}`, { method: 'DELETE' })
      if (res.ok) {
        setRevisions(prev => prev.filter(r => r.id !== revId))
        showToast('Revision deleted!')
      } else {
        alert("Failed to delete revision.")
      }
    } catch (err) {
      console.error('Delete error', err)
      alert("Failed to delete revision.")
    }
  }

  return (
    <>
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={onClose} />}
      <div className={`revision-drawer${open ? ' open' : ''}`} role="complementary" aria-label="Revision history">
        <div className="revision-drawer-header">
          <span className="revision-drawer-title">Revision History</span>
          <button id="close-revision-drawer" className="btn btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="revision-list">
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <div className="spinner" />
            </div>
          )}
          {!loading && revisions.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
              No saved revisions yet.
            </p>
          )}
          {revisions.map(rev => (
            <div 
              key={rev.id} 
              onClick={() => handleRevisionClick(rev.id)}
              style={{
                padding: 16,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                marginBottom: 8
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {format(new Date(rev.created_at), 'MMM d, h:mm a')}
                </span>
                
                <div style={{ display: 'flex', gap: 6 }}>
                  <button 
                    onClick={(e) => handleInstantRestore(e, rev.id)}
                    title="Instant Restore"
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 4 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, rev.id)}
                    title="Delete"
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
              
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                By <strong>{rev.author || 'Anonymous'}</strong>
              </div>
              {rev.description && <div className="revision-item-desc" style={{ fontSize: 13, color: 'var(--text-muted)' }}>"{rev.description}"</div>}
              
              {fetchingRev === rev.id && (
                <div style={{ position: 'absolute', right: 14, top: 20 }}>
                   <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="revision-drawer-footer">
          <input
            id="revision-description"
            className="form-input"
            placeholder="Description (optional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            style={{ marginBottom: 10, fontSize: 13, padding: '10px 14px' }}
          />
          <button
            id="save-revision-btn"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={saveRevision}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Revision'}
          </button>
        </div>
      </div>

      {toast && (
        <div className={`toast success show`}>{toast}</div>
      )}

      {selectedRevision && (
        <RevisionViewer
          revision={selectedRevision}
          onClose={() => {
             setSelectedRevision(null)
             setInstantRestoreMode(false)
          }}
          onRestore={onRestore}
          autoRestore={instantRestoreMode}
        />
      )}
    </>
  )
}
