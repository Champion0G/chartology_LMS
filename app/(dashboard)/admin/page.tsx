'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Plus, X, Users } from 'lucide-react'

type User = {
  id: string
  name: string
  email: string
  role: string
  level: number
  xp: number
  createdAt: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="fade-up">
        <h1 className="page-title" style={{ marginBottom: 28 }}>Admin Panel</h1>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 10, borderRadius: 8 }} />)}
      </div>
    )
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Shield size={20} style={{ color: 'var(--accent-purple)' }} />
            <h1 className="page-title" style={{ margin: 0 }}>Admin Panel</h1>
          </div>
          <p className="page-sub">{users.length} total users</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Create Teacher Account
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Level / XP</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${u.role === 'TEACHER' ? 'badge-blue' : u.role === 'ADMIN' ? 'badge-purple' : 'badge-success'}`}>
                    {u.role.toLowerCase()}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>
                  {u.role === 'STUDENT' ? `Lv.${u.level} · ${u.xp} XP` : '—'}
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateTeacherModal onClose={() => setShowCreate(false)} onCreated={load} />}

      <style jsx>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        .page-title { font-size: 26px; font-weight: 700; }
        .page-sub { color: var(--text-muted); font-size: 14px; }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th { padding: 12px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.7px; color: var(--text-muted); text-align: left; border-bottom: 1px solid var(--border); }
        .users-table td { padding: 14px 20px; border-bottom: 1px solid var(--border); }
        .users-table tr:last-child td { border-bottom: none; }
        .users-table tr:hover td { background: var(--bg-card); }
      `}</style>
    </div>
  )
}

function CreateTeacherModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'TEACHER' }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error)
      setLoading(false)
      return
    }
    onCreated()
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18 }}>Create Teacher Account</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>{error}</div>}
          <div><label className="label">Full Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><label className="label">Password</label><input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Teacher'}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
        .modal { width: 100%; max-width: 460px; padding: 28px; margin: 16px; }
      `}</style>
    </div>
  )
}
