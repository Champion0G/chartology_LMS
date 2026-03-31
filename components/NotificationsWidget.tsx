'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, BellRing } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export default function NotificationsWidget() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/notifications').then(res => {
      if (res.ok) res.json().then(setNotifications)
    })
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  async function markRead(id: string) {
    await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id }) })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id: 'all' }) })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 ? <BellRing size={16} color="var(--accent-blue)" /> : <Bell size={16} />}
          Notifications
          {unreadCount > 0 && (
             <span className="badge badge-blue" style={{ fontSize: 11, padding: '2px 6px', borderRadius: 10 }}>{unreadCount} New</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={12} /> Mark all read
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            You have no notifications yet.
          </div>
        ) : (
          <div style={{ flex: 1, height: '100%', overflowY: 'auto' }} className="custom-scrollbar">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className="activity-item" 
                style={{ 
                  margin: 0, 
                  borderRadius: 0, 
                  borderBottom: '1px solid var(--border)', 
                  background: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  cursor: n.link ? 'pointer' : 'default',
                  padding: '16px'
                }}
                onClick={() => {
                  if (!n.isRead) markRead(n.id);
                  if (n.link) router.push(n.link);
                }}
              >
                <div className="activity-icon" style={{ background: n.isRead ? 'var(--bg-card)' : 'var(--accent-blue-dim)', color: n.isRead ? 'var(--text-muted)' : 'var(--accent-blue)' }}>
                  <Bell size={16} />
                </div>
                <div className="activity-info" style={{ flex: 1 }}>
                  <div className="activity-title" style={{ fontWeight: n.isRead ? 500 : 600 }}>{n.title}</div>
                  <div className="activity-meta" style={{ color: n.isRead ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{n.message}</div>
                  <div className="activity-meta" style={{ fontSize: 11, marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
      `}</style>
    </div>
  )
}
