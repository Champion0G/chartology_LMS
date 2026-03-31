'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Invalid credentials')
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
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">C</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your Chartology account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          <div className="field">
            <label className="label" htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="email"
                type="email"
                className="input input-with-icon"
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
              <Lock size={16} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input input-with-icon input-with-action"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: '8px', fontSize: '15px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="auth-link">Create one</Link>
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
        }

        .auth-bg {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          position: relative;
          z-index: 1;
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
          box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
        }

        .auth-title {
          font-size: 24px;
          margin-bottom: 6px;
        }

        .auth-sub {
          color: var(--text-muted);
          font-size: 14px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon {
          padding-left: 42px;
        }

        .input-with-action {
          padding-right: 42px;
        }

        .input-action {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.15s;
        }

        .input-action:hover {
          color: var(--text-primary);
        }

        .error-banner {
          background: var(--danger-dim);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          font-size: 13px;
        }

        .auth-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .auth-link {
          color: var(--accent-purple);
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.15s;
        }

        .auth-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  )
}
