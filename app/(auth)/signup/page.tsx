'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Signup failed')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <div className="auth-card glass-card fade-up">
        <div className="auth-header">
          <div className="auth-logo">C</div>
          <h1 className="auth-title">Join Chartology</h1>
          <p className="auth-sub">Create your student account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label className="label" htmlFor="name">Full name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input input-with-action"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button type="button" className="input-action" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="info-note">
            <span>📚</span>
            <span>Teacher accounts are created by admins. Sign up here for a student account.</span>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: '4px', fontSize: '15px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          background: #05050f;
        }
        .auth-bg {
          position: fixed;
          inset: 0;
          /* Extended semi-circular gradient covering the top half */
          background: 
            radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.45) 0%, rgba(239, 68, 68, 0.2) 35%, rgba(239, 68, 68, 0.05) 70%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }
        /* Subtle divider to 'put the page in half' as per doodle */
        .auth-bg::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
        }
        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          position: relative;
          z-index: 1;
          border-radius: 40px !important;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-logo {
          width: 52px;
          height: 52px;
          background: var(--gradient);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 24px;
          color: #fff;
          margin: 0 auto 20px;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
        }
        .auth-title { font-size: 24px; margin-bottom: 6px; }
        .auth-sub { color: var(--text-muted); font-size: 14px; }
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .field { display: flex; flex-direction: column; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon { position: absolute; left: 14px; color: var(--text-muted); pointer-events: none; }
        .input-with-icon { padding-left: 42px; }
        .input-with-action { padding-right: 42px; }
        .input-action {
          position: absolute; right: 12px; background: none; border: none;
          color: var(--text-muted); cursor: pointer; display: flex; align-items: center;
          padding: 4px; transition: color 0.15s;
        }
        .input-action:hover { color: var(--text-primary); }
        .error-banner {
          background: var(--danger-dim); border: 1px solid rgba(239,68,68,0.2);
          color: var(--danger); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px;
        }
        .info-note {
          display: flex; gap: 8px; align-items: flex-start;
          background: var(--accent-blue-dim); border: 1px solid rgba(59,130,246,0.15);
          border-radius: var(--radius-sm); padding: 10px 14px;
          font-size: 12px; color: var(--text-secondary); line-height: 1.5;
        }
        .auth-footer { text-align: center; margin-top: 24px; font-size: 13px; color: var(--text-muted); }
        :global(.auth-link) {
          color: #ef4444 !important;
          text-decoration: underline !important;
          text-underline-offset: 4px !important;
          font-weight: 600 !important;
          transition: all 0.2s !important;
        }
        :global(.auth-link:hover) { color: #f87171 !important; opacity: 1 !important; }
      `}</style>
    </div>
  )
}
