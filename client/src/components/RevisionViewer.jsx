import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import * as Y from 'yjs'
import { format } from 'date-fns'
import { useEffect, useMemo } from 'react'

export default function RevisionViewer({ revision, onClose, onRestore, autoRestore }) {
  const ydocOffline = useMemo(() => {
    const doc = new Y.Doc()
    if (revision?.snapshot_b64) {
      try {
        const binaryString = atob(revision.snapshot_b64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        Y.applyUpdate(doc, bytes)
      } catch (e) {
        console.error("Failed to parse revision snapshot", e)
      }
    }
    return doc
  }, [revision?.snapshot_b64])

  const editor = useEditor(
    {
      editable: false,
      extensions: [
        StarterKit.configure({ history: false }),
        Underline,
        Highlight,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Collaboration.configure({ document: ydocOffline }),
      ],
      editorProps: {
        attributes: { class: 'ProseMirror readonly-prosemirror' },
      },
    },
    [ydocOffline]
  )

  useEffect(() => {
    if (autoRestore && editor && !editor.isDestroyed) {
      onRestore(editor.getHTML())
      onClose()
    }
  }, [autoRestore, editor, onRestore, onClose])

  const handleRestoreClick = () => {
    if (editor && confirm("Are you sure you want to restore to exactly this version? This will overwrite the live document!")) {
      onRestore(editor.getHTML())
      onClose()
    }
  }

  // If we are just using this component to quickly extract HTML headless, hide the Viewer UI
  if (autoRestore) return null

  return (
    <div className="modal-overlay" style={{ zIndex: 400 }}>
      <div className="modal" style={{ maxWidth: 800, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-glass)' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
              Revision by {revision.author || 'Anonymous'}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {format(new Date(revision.created_at), 'MMM d, yyyy · h:mm a')} 
              {revision.description && ` — "${revision.description}"`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-sm btn-primary" onClick={handleRestoreClick}>Restore Version</button>
            <button className="btn btn-sm" onClick={onClose}>Close Viewer</button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 64px', background: 'var(--bg-surface)' }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
