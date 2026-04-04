import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function Home() {
  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="brand">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <span className="brand-name">noteus</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px' }}>
        <div style={{ maxWidth: 800 }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24 }}>
            Write, plan, and create <br/><span style={{ color: 'var(--accent)' }}>together in real-time.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
            noteus is a beautiful, professional workspace for your team. Instantly sync documents with powerful CRDT technology.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 16, borderRadius: 'var(--radius-lg)' }}>
              Start Writing Now — It's Free
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32, maxWidth: 1000, width: '100%', marginTop: 100, textAlign: 'left' }}>
          
          <div style={{ padding: 40, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s, box-shadow 0.3s' }} className="home-feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
               <div style={{ width: 56, height: 56, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.1)' }}>
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
               </div>
               <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Instant Sync</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 16 }}>Updates appear instantly across all devices. No merged conflicts or clunky refreshing, just seamless collaboration powered by robust sub-millisecond CRDT data algorithms.</p>
          </div>
          
          <div style={{ padding: 40, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s, box-shadow 0.3s' }} className="home-feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.1)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Version History</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 16 }}>Never lose your work ever again. Capture snapshots of your document over time, visually inspect them, and restore them natively within the editor backwards in time.</p>
          </div>

          <div style={{ padding: 40, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s, box-shadow 0.3s' }} className="home-feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.1)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Live Presence</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 16 }}>See strictly who is currently viewing and editing your document with live avatar identifiers and beautifully synchronized real-time caret presence indicators.</p>
          </div>

          <div style={{ padding: 40, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', transition: 'transform 0.3s, box-shadow 0.3s' }} className="home-feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.1)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Rich Formatting</h3>
             </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 16 }}>Express your ideas completely and cleanly with integrated block formatting, lists, dynamic highlights, and highly structured, sleek typography layouts.</p>
          </div>
          
        </div>

        {/* How It Works Section */}
        <div style={{ maxWidth: 800, width: '100%', marginTop: 120, textAlign: 'left', background: 'var(--bg-glass)', padding: '40px 48px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 32, color: 'var(--text-primary)', textAlign: 'center' }}>
            How to use noteus
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Create a Workspace</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Click "Start Writing Now" and create a fresh document workspace. Name it whatever you like.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Share The Link</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Once inside your document, click the prominent blue <strong>Share</strong> button in the top right to instantly copy the private room link. Send this link to anyone.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Write & Collaborate</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Users joining your link will instantly appear as distinct avatars in your sidebar. Their cursors will fly across your screen as you both type in real-time without collisions.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>4</div>
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Manage Your History</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>At any time, open the <strong>History</strong> panel. You can save manual snapshots, permanently delete messy ones, or single-click to <strong>Restore</strong> the document backward in time!</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
