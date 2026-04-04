export default function PresenceBar({ users }) {
  if (!users.length) return null

  return (
    <aside className="presence-bar">
      <p className="presence-title">Online ({users.length})</p>
      {users.map((u) => (
        <div key={u.clientId} className={`presence-user${u.isMe ? ' is-me' : ''}`}>
          <div
            className="presence-avatar"
            style={{ background: u.color }}
            title={u.name}
          >
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="presence-name">{u.name}</div>
            {u.isMe && <div className="presence-you">You</div>}
          </div>
          {!u.isMe && <span className="presence-typing-dot" title="Online" />}
        </div>
      ))}
    </aside>
  )
}
