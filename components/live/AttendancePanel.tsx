'use client'

import { useState, useEffect } from 'react'
import { X, Users, MessageSquare, Loader2, Clock } from 'lucide-react'

type Attendee = {
  id: string
  joinedAt: string
  user: { id: string; name: string; email: string }
}

type ChatMsg = {
  id: string
  message: string
  createdAt: string
  user: { name: string }
}

type Props = { classId: string; className: string; onClose: () => void }

export default function AttendancePanel({ classId, className, onClose }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'attendance' | 'chat'>('attendance')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [attRes, chatRes] = await Promise.all([
          fetch(`/api/live-classes/attendance?classId=${classId}`),
          fetch(`/api/live-classes/chat?classId=${classId}`)
        ])
        const attData = await attRes.json()
        const chatData = await chatRes.json()
        setAttendees(Array.isArray(attData) ? attData : [])
        setChatHistory(Array.isArray(chatData) ? chatData : [])
      } catch (e) {
        console.error('Failed to fetch panel data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [classId])

  return (
    <div className="att-overlay" onClick={onClose}>
      <div className="att-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>Class Record</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3 }}>{className}</p>
          </div>
          <button className="att-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 12, marginBottom: 24 }}>
          <button 
            onClick={() => setActiveTab('attendance')}
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: 'none',
              background: activeTab === 'attendance' ? 'rgba(239,68,68,0.15)' : 'transparent',
              color: activeTab === 'attendance' ? '#ef4444' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Users size={15} /> Attendance
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            style={{ 
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: 'none',
              background: activeTab === 'chat' ? 'rgba(239,68,68,0.15)' : 'transparent',
              color: activeTab === 'chat' ? '#ef4444' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <MessageSquare size={15} /> Chat History
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 size={28} className="att-spin" style={{ color: '#ef4444' }} />
          </div>
        ) : (
          <div className="tab-content">
            {activeTab === 'attendance' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: 10, marginBottom: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                  {attendees.length} total participants
                </div>
                {attendees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>No attendance yet.</div>
                ) : (
                  attendees.map((a, i) => (
                    <div key={a.id} className="item-card">
                      <div className="item-idx">{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="item-name">{a.user.name}</div>
                        <div className="item-sub">{a.user.email}</div>
                      </div>
                      <div className="item-time">{new Date(a.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>No messages recorded.</div>
                ) : (
                  chatHistory.map((m) => (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>{m.user.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: 1.4 }}>{m.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          .att-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 10000; display: flex; align-items: center; justify-content: flex-end; }
          .att-panel { width: 440px; max-width: 100vw; height: 100vh; background: #080812; border-left: 1px solid var(--border); padding: 32px 28px; overflow-y: auto; box-shadow: -10px 0 30px rgba(0,0,0,0.5); animation: slideIn 0.3s cubic-bezier(0.16,1,0.3,1); }
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          .att-close { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-muted); padding: 8px; border-radius: 10px; cursor: pointer; display: flex; transition: all 0.2s; }
          .att-close:hover { background: rgba(239,68,68,0.1); color: #f87171; }
          .att-spin { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .item-card { display: flex; alignItems: center; gap: 14; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--border); }
          .item-idx { width: 30; height: 30; border-radius: 8px; background: rgba(239,68,68,0.1); display: flex; alignItems: center; justifyContent: center; fontSize: 12; fontWeight: 700; color: #ef4444; flexShrink: 0; }
          .item-name { font-size: 14; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .item-sub { font-size: 11; color: var(--text-muted); margin-top: 2; }
          .item-time { font-size: 11; color: var(--text-muted); flex-shrink: 0; }
        `}</style>
      </div>
    </div>
  )
}
