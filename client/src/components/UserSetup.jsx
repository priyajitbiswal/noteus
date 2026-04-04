import { useState } from 'react'
import { COLORS, useUserStore } from '../store/userStore'

export default function UserSetup({ onClose }) {
  const { name: savedName, color: savedColor, setupUser } = useUserStore()
  const [name, setName] = useState(savedName || '')
  const [color, setColor] = useState(savedColor)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name'); return }
    if (trimmed.length > 30) { setError('Name must be 30 characters or less'); return }
    setupUser(trimmed, color)
    if (onClose) onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose ? onClose : undefined}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
        <h1 className="modal-title">{onClose ? 'Edit Profile' : 'Welcome to noteus'}</h1>
        <p className="modal-subtitle">
          Choose your display name and colour before joining.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="user-name">Your Name</label>
            <input
              id="user-name"
              className="form-input"
              type="text"
              placeholder="e.g. Alice"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              autoFocus
              maxLength={30}
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{error}</p>}
          </div>

          <div className="form-field">
            <label className="form-label">Your Colour</label>
            <div className="color-swatches">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select colour ${c}`}
                />
              ))}
            </div>
          </div>

          <button id="user-setup-submit" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            {onClose ? 'Save' : 'Start Editing'}
          </button>
        </form>
      </div>
    </div>
  )
}
