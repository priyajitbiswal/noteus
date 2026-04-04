import { useEffect, useRef, useState, useCallback } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export function useCollaboration(docId, user) {
  const ydocRef = useRef(null)
  const providerRef = useRef(null)
  const [status, setStatus] = useState('connecting')  // connecting | connected | disconnected
  const [awarenessUsers, setAwarenessUsers] = useState([])

  useEffect(() => {
    if (!docId || !user?.name) return

    // Create Yjs document
    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    // Connect via WebSocket
    const wsUrl = `${WS_URL}/ws`
    const provider = new WebsocketProvider(wsUrl, docId, ydoc, {
      connect: true,
      params: {},
    })
    providerRef.current = provider

    // Set local awareness state (presence)
    provider.awareness.setLocalStateField('user', {
      id: user.id,
      name: user.name,
      color: user.color,
    })

    // Connection status
    provider.on('status', ({ status }) => setStatus(status))

    // Awareness changes (who's online)
    const updatePresence = () => {
      const uniqueUsers = new Map()
      
      provider.awareness.getStates().forEach((state, clientId) => {
        if (state.user && state.user.name) {
          const existing = uniqueUsers.get(state.user.name)
          const isMe = clientId === ydoc.clientID
          
          if (!existing || isMe) {
            uniqueUsers.set(state.user.name, {
              clientId,
              ...state.user,
              isMe,
            })
          }
        }
      })
      setAwarenessUsers(Array.from(uniqueUsers.values()))
    }
    provider.awareness.on('change', updatePresence)
    updatePresence()

    return () => {
      provider.awareness.off('change', updatePresence)
      provider.destroy()
      ydoc.destroy()
      ydocRef.current = null
      providerRef.current = null
    }
  }, [docId, user?.name, user?.id, user?.color])

  const getSnapshot = useCallback(() => {
    if (!ydocRef.current) return null
    return Y.encodeStateAsUpdate(ydocRef.current)
  }, [])

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    status,
    awarenessUsers,
    getSnapshot,
  }
}
