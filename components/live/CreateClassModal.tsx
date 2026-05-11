'use client'

import { useState } from 'react'
import { X, Loader2, Calendar, Clock, FileText, AlignLeft } from 'lucide-react'

type Props = { onClose: () => void; onCreated: () => void }

export default function CreateClassModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Set the minimum datetime to now (local)
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, startTime, durationMinutes }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error || 'Something went wrong')
        return
      }

      onCreated()
    } catch {
      setError('Failed to create class. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-breakout-overlay">
      <div className="modal-fullscreen-content">
        <div className="modal-fullscreen-wrapper">

          {/* Header */}
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 48 }}>
            <div>
              <h2 className="gradient-text" style={{ fontSize: 36, fontWeight: 800 }}>Schedule Live Class</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6 }}>
                Set up a new live session for your students
              </p>
            </div>
            <button className="close-btn-breakout" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }}>

              {/* Title */}
              <div className="lcc-field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">
                  <FileText size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Class Title
                </label>
                <input
                  className="input"
                  placeholder="e.g. Chapter 5: Advanced Options Trading"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="lcc-field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">
                  <AlignLeft size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  className="input lcc-textarea"
                  placeholder="What will students learn in this class?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Start time */}
              <div className="lcc-field">
                <label className="label">
                  <Calendar size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="input lcc-datetime"
                  min={nowLocal}
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                />
              </div>

              {/* Duration */}
              <div className="lcc-field">
                <label className="label">
                  <Clock size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Duration
                </label>
                <select
                  className="input"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10, padding: '12px 16px', marginBottom: 24,
                color: '#f87171', fontSize: 14
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" style={{ padding: '13px 28px' }} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '13px 32px', display: 'flex', alignItems: 'center', gap: 8 }} disabled={loading}>
                {loading ? <Loader2 size={18} className="lcc-spin" /> : null}
                {loading ? 'Scheduling...' : 'Schedule Class'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .modal-breakout-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--bg-primary); z-index: 999999; overflow-y: auto; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .modal-fullscreen-content { width: 100%; max-width: 780px; }
        .modal-fullscreen-wrapper { padding: 0; }
        .close-btn-breakout { position: fixed; top: 40px; right: 40px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-muted); padding: 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; z-index: 1000000; }
        .close-btn-breakout:hover { background: rgba(239,68,68,0.1); color: var(--danger); border-color: var(--danger-dim); }
        .lcc-field { display: flex; flex-direction: column; gap: 8px; }
        .lcc-textarea { resize: vertical; min-height: 80px; font-family: 'Inter', sans-serif; }
        .lcc-datetime { color-scheme: dark; }
        .lcc-spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .modal-breakout-overlay { padding: 20px; align-items: flex-start; }
          .close-btn-breakout { top: 20px; right: 20px; }
          form > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
