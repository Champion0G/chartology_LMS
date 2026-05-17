'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Calendar, Clock, FileText, AlignLeft } from 'lucide-react'

type Props = { onClose: () => void; onCreated: () => void }

export default function CreateClassModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Lock body and html scroll when modal is open
  useEffect(() => {
    const originalBody = document.body.style.overflow
    const originalHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => { 
      document.body.style.overflow = originalBody
      document.documentElement.style.overflow = originalHtml
    }
  }, [])

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

  async function handleInstantMeeting() {
    setError('')
    setLoading(true)

    // Set start time to right now
    const nowISO = new Date().toISOString()
    const currentTitle = title.trim()
      ? title
      : `Instant Meeting - ${new Date().toLocaleTimeString()}`

    try {
      const res = await fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTitle,
          description,
          startTime: nowISO,
          durationMinutes,
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        setError(error || 'Something went wrong')
        return
      }

      onCreated()
    } catch {
      setError('Failed to start instant meeting. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return createPortal((
    <div
      className="dashboard-modal-overlay"
      style={{
        background: '#000',
      }}
    >
      <div
        className="glass-card dashboard-modal-card"
        style={{
          width: '100%',
          maxWidth: '650px',
          padding: '40px',
          position: 'relative',
          overflow: 'visible',
          background: '#000000', /* Solid black background */
          border: '2px solid rgba(239, 68, 68, 0.8)',
          boxShadow: '0 0 35px rgba(239, 68, 68, 0.4)',
        }}
      >
        <div className="modal-content-wrapper">

          {/* Header */}
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <h2 className="gradient-text" style={{ fontSize: 28, fontWeight: 800 }}>Schedule Live Class</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
                Set up a new live session for your students
              </p>
            </div>
            <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 28 }}>

              {/* Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / -1' }}>
                <label className="label">
                  <FileText size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Class Title
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Advanced Technical Analysis"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / -1' }}>
                <label className="label">
                  <AlignLeft size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  className="input"
                  style={{ resize: 'vertical', minHeight: '80px', fontFamily: "'Inter', sans-serif" }}
                  placeholder="What will students learn in this class?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Start time */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="label">
                  <Calendar size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="input"
                  style={{ colorScheme: 'dark' }}
                  min={nowLocal}
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                />
              </div>

              {/* Duration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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

            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" className="btn-secondary" style={{ padding: '10px 20px' }} onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn-secondary" style={{ padding: '10px 20px', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }} onClick={handleInstantMeeting} disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} /> : null}
                Start Instant Meeting
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }} disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {loading ? 'Scheduling...' : 'Schedule Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ), document.body)
}
