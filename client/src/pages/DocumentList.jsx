import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import ThemeToggle from '../components/ThemeToggle'
import UserSetup from '../components/UserSetup'
import { useUserStore } from '../store/userStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function DocumentList() {
  const [docs, setDocs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  
  const user = useUserStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API}/documents`)
      .then(r => r.json())
      .then(data => { setDocs(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const createDoc = async () => {
    setCreating(true)
    try {
      const res = await fetch(`${API}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Document' }),
      })
      const doc = await res.json()
      navigate(`/doc/${doc.id}`)
    } catch {
      setCreating(false)
    }
  }

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if(confirm('Are you sure you want to delete this document?')) {
      fetch(`${API}/documents/${id}`, { method: 'DELETE' })
        .then(() => setDocs(prev => prev.filter(d => d.id !== id)));
    }
  }

  const filteredDocs = docs.filter(d => (d.title || 'Untitled').toLowerCase().includes(search.toLowerCase()))

  const navItemStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
    background: active ? 'var(--accent-dim)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    fontWeight: 500, cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%',
    transition: 'background 0.2s, color 0.2s', fontSize: 14
  })

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: 260, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <Link to="/" className="brand" style={{ textDecoration: 'none', padding: '0 8px', marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand-icon" style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <span className="brand-name" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>noteus</span>
        </Link>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button style={navItemStyle(true)}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             All Documents
          </button>
          <button style={navItemStyle(false)}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             Shared with me
          </button>
          <button style={navItemStyle(false)}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
             Settings
          </button>
        </nav>

        <button 
          onClick={() => setEditingProfile(true)}
          style={{ marginTop: 'auto', padding: '12px 10px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
          className="doc-list-row-hover"
        >
           <div style={{ width: 32, height: 32, borderRadius: 16, background: user.isSetup ? user.color : 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
             {user.isSetup && user.name ? user.name[0].toUpperCase() : 'U'}
           </div>
           <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
             {user.isSetup && user.name ? user.name : 'Anonymous User'}
             <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, marginTop: 2 }}>Edit Profile</div>
           </div>
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Dashboard Header */}
        <header style={{ height: 72, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'var(--bg-glass)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ position: 'relative', width: 320 }}>
            <svg style={{ position: 'absolute', left: 14, top: 10, color: 'var(--text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              placeholder="Search documents by title..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '9px 16px 9px 40px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div>
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '48px 40px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 40, color: 'var(--text-primary)' }}>
            Welcome to your workspace{user.isSetup && user.name ? `, ${user.name}` : ''}.
          </h1>

          {/* Quick Actions */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Start a new document</div>
            <button onClick={createDoc} disabled={creating} style={{ 
                padding: 32, background: 'var(--bg-surface)', border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', gap: 16, width: 220, 
                cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' 
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>Blank Document</span>
            </button>
          </div>

          {/* Recent Documents Table */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Documents</div>
            
            {loading ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
            ) : filteredDocs.length === 0 ? (
               <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-surface)', border: '1px border dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
                 <p style={{ color: 'var(--text-muted)' }}>No documents found.</p>
               </div>
            ) : (
              <div className="doc-table" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                {/* Table Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 200px 80px', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                   <div>Title</div>
                   <div>Last Modified</div>
                   <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {/* Table Rows */}
                {filteredDocs.map(doc => (
                   <Link key={doc.id} to={`/doc/${doc.id}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 200px 80px', padding: '16px 24px', borderBottom: '1px solid var(--border)', textDecoration: 'none', alignItems: 'center', transition: 'background 0.1s' }} className="doc-list-row-hover">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                         <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                         </div>
                         <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{doc.title || 'Untitled Document'}</span>
                      </div>
                      
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                         {format(new Date(doc.updated_at), 'MMM d, yyyy · h:mm a')}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                         <button
                           onClick={(e) => handleDelete(e, doc.id)}
                           style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, borderRadius: 4 }}
                           className="btn-icon-hover-danger"
                           title="Delete Document"
                         >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                         </button>
                      </div>
                   </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Editing Profile Modal overlay */}
      {(!user.isSetup || editingProfile) && (
         <UserSetup onClose={user.isSetup ? () => setEditingProfile(false) : undefined} />
      )}
    </div>
  )
}
