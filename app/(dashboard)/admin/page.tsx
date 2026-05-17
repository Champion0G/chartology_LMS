'use client'

import { useState, useEffect, useCallback } from 'react'
import { Shield, Plus, X, Users, Trash2 } from 'lucide-react'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function deleteUser(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || 'Failed to delete user')
        return
      }
      load()
    } catch (e) {
      alert('Error deleting user')
    }
  }

  if (loading) {
    return (
      <div className="fade-up">
        <h1 className="page-title" style={{ marginBottom: 28 }}>Admin Panel</h1>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 10, borderRadius: 8 }} />)}
      </div>
    )
  }

  const filteredUsers = users
    .filter(u => {
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter
      return matchSearch && matchRole
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === 'level-desc') return b.level - a.level
      if (sortBy === 'level-asc') return a.level - b.level
      return 0
    })

  return (
    <div className="fade-up admin-container">
      <div className="page-header admin-header">
        <div className="admin-title-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Shield size={20} style={{ color: 'var(--accent-purple)' }} />
            <h1 className="page-title" style={{ margin: 0 }}>Admin Panel</h1>
          </div>
          <p className="page-sub">{users.length} total users</p>
        </div>
        <button className="btn-primary create-btn" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Create Teacher
        </button>
      </div>

      <div className="filter-bar glass-card">
        <input type="text" placeholder="Search users by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input search-input" />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input select-input">
          <option value="ALL" style={{color: 'black'}}>All Roles</option>
          <option value="STUDENT" style={{color: 'black'}}>Students</option>
          <option value="TEACHER" style={{color: 'black'}}>Teachers</option>
          <option value="ADMIN" style={{color: 'black'}}>Admins</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input select-input">
          <option value="newest" style={{color: 'black'}}>Newest First</option>
          <option value="oldest" style={{color: 'black'}}>Oldest First</option>
          <option value="level-desc" style={{color: 'black'}}>Highest Level</option>
          <option value="level-asc" style={{color: 'black'}}>Lowest Level</option>
        </select>
      </div>

      <div className="admin-content">
        {/* Desktop Table View */}
        <div className="glass-card table-card">
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Level / XP</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                        <div>
                          <div className="user-name-text">{u.name}</div>
                          <div className="user-email-text">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'TEACHER' ? 'badge-blue' : u.role === 'ADMIN' ? 'badge-purple' : 'badge-success'}`}>
                        {u.role.toLowerCase()}
                      </span>
                    </td>
                    <td className="level-cell">
                      {u.role === 'STUDENT' ? `Lv.${u.level} · ${u.xp} XP` : '—'}
                    </td>
                    <td className="date-cell">
                      {new Date(u.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <button className="btn-danger-dim" style={{ padding: '6px 10px' }} onClick={() => deleteUser(u.id, u.name)} title="Delete user">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-user-list">
          {filteredUsers.map(u => (
            <div key={u.id} className="glass-card user-mobile-card">
              <div className="user-mobile-header">
                <div className="user-avatar-small">
                  {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="user-name-text">{u.name}</div>
                  <div className="user-email-text">{u.email}</div>
                </div>
                <span className={`badge ${u.role === 'TEACHER' ? 'badge-blue' : u.role === 'ADMIN' ? 'badge-purple' : 'badge-success'}`}>
                  {u.role.toLowerCase()}
                </span>
              </div>
              <div className="user-mobile-stats">
                <div className="stat-item">
                  <span className="stat-label">Progress</span>
                  <span className="stat-value">{u.role === 'STUDENT' ? `Level ${u.level} · ${u.xp} XP` : 'N/A'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Joined</span>
                  <span className="stat-value">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-danger-dim" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12 }} onClick={() => deleteUser(u.id, u.name)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreate && <CreateTeacherModal onClose={() => setShowCreate(false)} onCreated={load} />}

      <style jsx>{`
        .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .page-title { font-size: 26px; font-weight: 700; }
        .page-sub { color: var(--text-muted); font-size: 14px; }
        
        .table-container { width: 100%; overflow-x: auto; }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th { padding: 16px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.7px; color: var(--text-muted); text-align: left; border-bottom: 1px solid var(--border); }
        .users-table td { padding: 16px 20px; border-bottom: 1px solid var(--border); }
        
        .user-cell { display: flex; align-items: center; gap: 12px; }
        .user-avatar-small { width: 32px; height: 32px; border-radius: 50%; background: var(--gradient); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-name-text { font-size: 14px; font-weight: 600; color: #fff; }
        .user-email-text { font-size: 12px; color: var(--text-muted); }
        
        .create-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; font-size: 14px; }
        
        .filter-bar { display: flex; gap: 16px; padding: 20px; margin-bottom: 28px; flex-wrap: wrap; align-items: center; }
        .search-input { flex: 1; min-width: 240px; background: rgba(0,0,0,0.3) !important; border-color: rgba(255,255,255,0.1); height: 48px; border-radius: 12px; padding: 0 16px; }
        .select-input { background: rgba(0,0,0,0.3) !important; border-color: rgba(255,255,255,0.1); color: #fff; min-width: 160px; height: 48px; border-radius: 12px; padding: 0 12px; cursor: pointer; }

        .mobile-user-list { display: none; flex-direction: column; gap: 12px; }
        
        @media (max-width: 768px) {
          .admin-header { flex-direction: column; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
          .create-btn { width: 100%; justify-content: center; padding: 14px; font-size: 15px; }
          .admin-title-section { width: 100%; }
          .page-title { font-size: 22px; }
          
          .table-card { display: none; }
          .mobile-user-list { display: flex; }
          
          .user-mobile-card { padding: 16px; }
          .user-mobile-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
          .user-mobile-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .stat-item { display: flex; flex-direction: column; gap: 4px; }
          .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
          .stat-value { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
        }
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
      <div className="modal glass-card modal-fade-in">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Create Teacher</h2>
            <p className="modal-subtitle">Register a new instructor account</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-alert">{error}</div>}
          
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input mobile-input" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input mobile-input" type="email" placeholder="john@csol.in" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          
          <div className="form-group">
            <label className="label">Access Password</label>
            <input className="input mobile-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary mobile-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary mobile-btn highlight-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(5, 5, 15, 0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(12px); padding: 20px; }
        .modal { width: 100%; max-width: 440px; padding: 32px; border: 1px solid rgba(255,255,255,0.08); }
        .modal-fade-in { animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .modal-title { font-size: 20px; font-weight: 700; color: #fff; }
        .modal-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
        .close-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 8px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .close-btn:hover { background: var(--danger-dim); color: var(--danger); border-color: rgba(239,68,68,0.2); }
        
        .modal-form { display: flex; flex-direction: column; gap: 20px; }
        .error-alert { background: var(--danger-dim); color: var(--danger); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 12px 16px; font-size: 13px; font-weight: 500; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .mobile-input { height: 48px; border-radius: 12px; background: rgba(0,0,0,0.3); border-color: rgba(255,255,255,0.1); width: 100%; }
        
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 4px; }
        .mobile-btn { padding: 12px 20px; font-size: 14px; border-radius: 12px; font-weight: 600; }
        .highlight-btn { flex: 1; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3); }

        @media (max-width: 480px) {
          .modal { padding: 24px; border-radius: 20px; }
          .modal-actions { flex-direction: column-reverse; gap: 8px; }
          .mobile-btn { width: 100%; padding: 14px; }
          .modal-overlay { padding: 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom, 0)); }
        }
      `}</style>
    </div>
  )
}
