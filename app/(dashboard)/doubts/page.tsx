'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, CheckCircle, Plus, X } from 'lucide-react'

type Doubt = {
  id: string
  question: string
  reply: string | null
  status: 'OPEN' | 'RESOLVED'
  createdAt: string
  student?: { name: string; email: string }
}

export default function DoubtsPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAsk, setShowAsk] = useState(false)
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [replying, setReplying] = useState(false)

  const load = useCallback(async () => {
    const [dRes, mRes] = await Promise.all([fetch('/api/doubts'), fetch('/api/me')])
    const [d, m] = await Promise.all([dRes.json(), mRes.json()])
    setDoubts(d)
    setRole(m.role || '')
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function submitDoubt(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await fetch('/api/doubts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    setQuestion('')
    setShowAsk(false)
    setSubmitting(false)
    load()
  }

  async function submitReply(id: string) {
    setReplying(true)
    await fetch(`/api/doubts/${id}/reply`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    })
    setReplyingId(null)
    setReply('')
    setReplying(false)
    load()
  }

  if (loading) {
    return (
      <div className="fade-up">
        <h1 className="page-title" style={{ marginBottom: 28 }}>Doubts</h1>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, marginBottom: 12, borderRadius: 12 }} />)}
      </div>
    )
  }

  const open = doubts.filter(d => d.status === 'OPEN')
  const resolved = doubts.filter(d => d.status === 'RESOLVED')

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doubts</h1>
          <p className="page-sub">
            {role === 'STUDENT'
              ? `${open.length} open · ${resolved.length} resolved`
              : `${open.length} awaiting reply`}
          </p>
        </div>
        {role === 'STUDENT' && (
          <button className="btn-primary" onClick={() => setShowAsk(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Ask a Doubt
          </button>
        )}
      </div>

      {/* Ask Modal */}
      {showAsk && (
        <div className="modal-overlay">
          <div className="modal glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18 }}>Ask a Doubt</h2>
              <button onClick={() => setShowAsk(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={submitDoubt}>
              <label className="label">Your question</label>
              <textarea
                className="input"
                rows={5}
                placeholder="Describe your doubt clearly..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAsk(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting || !question.trim()}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {doubts.length === 0 ? (
        <div className="empty-state glass-card">
          <MessageCircle size={32} style={{ opacity: 0.3 }} />
          <p>{role === 'STUDENT' ? 'No doubts yet. Ask your first question!' : 'No doubts submitted yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {doubts.map((d) => (
            <div key={d.id} className="glass-card doubt-card">
              <div className="doubt-header">
                {d.student && (
                  <div className="doubt-student">
                    <div className="student-avatar">{d.student.name[0]}</div>
                    <span>{d.student.name}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                  <span className="doubt-date">{new Date(d.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`badge ${d.status === 'OPEN' ? 'badge-warning' : 'badge-success'}`}>
                    {d.status === 'OPEN' ? 'Open' : 'Resolved'}
                  </span>
                </div>
              </div>

              <p className="doubt-question">{d.question}</p>

              {d.reply && (
                <div className="doubt-reply">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Teacher&apos;s Reply</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{d.reply}</p>
                </div>
              )}

              {(role === 'TEACHER' || role === 'ADMIN') && d.status === 'OPEN' && (
                <>
                  {replyingId === d.id ? (
                    <div className="reply-form">
                      <textarea className="input" rows={3} placeholder="Write your reply..." value={reply} onChange={e => setReply(e.target.value)} style={{ resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button className="btn-primary" onClick={() => submitReply(d.id)} disabled={replying || !reply.trim()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}>
                          <Send size={13} /> {replying ? 'Sending...' : 'Reply & Resolve'}
                        </button>
                        <button className="btn-secondary" onClick={() => setReplyingId(null)} style={{ padding: '8px 14px', fontSize: 13 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-secondary" onClick={() => setReplyingId(d.id)} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13 }}>
                      <Send size={13} /> Reply to Doubt
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        .page-title { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
        .page-sub { color: var(--text-muted); font-size: 14px; }
        .doubt-card { padding: 20px; }
        .doubt-header { display: flex; align-items: center; margin-bottom: 14px; }
        .doubt-student { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
        .student-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--gradient); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .doubt-date { font-size: 12px; color: var(--text-muted); }
        .doubt-question { font-size: 15px; line-height: 1.65; color: var(--text-primary); }
        .doubt-reply { margin-top: 16px; background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.15); border-radius: 8px; padding: 14px; }
        .reply-form { margin-top: 14px; border-top: 1px solid var(--border); padding-top: 14px; }
        .empty-state { padding: 48px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; color: var(--text-muted); font-size: 14px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
        .modal { width: 100%; max-width: 500px; padding: 28px; margin: 16px; }
      `}</style>
    </div>
  )
}
