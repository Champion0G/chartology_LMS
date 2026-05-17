'use client'

import { useState } from 'react'
import { Settings, Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EditProfileForm({ user }: { user: { name: string; email: string } }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess('Profile updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <button className="btn-secondary" style={{ width: '100%', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setIsEditing(true)}>
        <Settings size={16} /> Edit Profile
      </button>
    )
  }

  return (
    <form onSubmit={handleSave} style={{ marginTop: 24, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Settings size={18} style={{ color: 'var(--accent-purple)' }} /> Edit Profile
      </h3>
      
      {error && <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ padding: '10px 14px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{success}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label" style={{ fontSize: 12 }}>Name</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        
        <div>
          <label className="label" style={{ fontSize: 12 }}>Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16, marginTop: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Change Password (Optional)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label" style={{ fontSize: 12 }}>Current Password</label>
              <input className="input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
            <div>
              <label className="label" style={{ fontSize: 12 }}>New Password</label>
              <input className="input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
        <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
          {loading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <style jsx>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </form>
  )
}
