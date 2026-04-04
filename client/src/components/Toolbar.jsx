// SVG icon helpers
const B = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
const I = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
const U = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
const H1 = () => <span style={{ fontSize: 13, fontWeight: 700 }}>H1</span>
const H2 = () => <span style={{ fontSize: 13, fontWeight: 700 }}>H2</span>
const BL = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
const OL = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
const HI = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
const UN = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" /><path d="M22 21H7" /><path d="m5 11 9 9" /></svg>

export default function Toolbar({ editor }) {
  if (!editor) return null

  const btn = (label, action, active) => (
    <button
      id={`toolbar-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={`toolbar-btn${active ? ' is-active' : ''}`}
      onClick={action}
      title={label}
      type="button"
    >
      {typeof label === 'string' ? label : label}
    </button>
  )

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting toolbar">
      <div className="toolbar-group">
        <button id="toolbar-bold" className={`toolbar-btn${editor.isActive('bold') ? ' is-active' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)" type="button"><B /></button>
        <button id="toolbar-italic" className={`toolbar-btn${editor.isActive('italic') ? ' is-active' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)" type="button"><I /></button>
        <button id="toolbar-underline" className={`toolbar-btn${editor.isActive('underline') ? ' is-active' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)" type="button"><U /></button>
        <button id="toolbar-highlight" className={`toolbar-btn${editor.isActive('highlight') ? ' is-active' : ''}`} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Highlight" type="button"><HI /></button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button id="toolbar-h1" className={`toolbar-btn${editor.isActive('heading', { level: 1 }) ? ' is-active' : ''}`} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1" type="button"><H1 /></button>
        <button id="toolbar-h2" className={`toolbar-btn${editor.isActive('heading', { level: 2 }) ? ' is-active' : ''}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2" type="button"><H2 /></button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button id="toolbar-bullet-list" className={`toolbar-btn${editor.isActive('bulletList') ? ' is-active' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list" type="button"><BL /></button>
        <button id="toolbar-ordered-list" className={`toolbar-btn${editor.isActive('orderedList') ? ' is-active' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list" type="button"><OL /></button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button id="toolbar-clear-format" className="toolbar-btn" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting" type="button"><UN /></button>
      </div>
    </div>
  )
}
