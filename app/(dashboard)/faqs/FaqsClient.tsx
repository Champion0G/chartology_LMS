'use client'

import { useState, useEffect, useCallback } from 'react'
import { HelpCircle, Plus, X, Video, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

type Faq = {
  id: string
  question: string
  answer: string
  videoUrl: string | null
  pdfUrl: string | null
  imageUrl: string | null
  link: string | null
  teacher: { name: string }
  createdAt: string
}

export default function FaqsClient({ role }: { role: string }) {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadFaqs = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/faqs')
      if (res.ok) setFaqs(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadFaqs() }, [loadFaqs])

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <HelpCircle size={28} style={{ color: 'var(--accent-purple)' }} />
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Frequently Asked Questions</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Common doubts answered by our instructors.</p>
          </div>
        </div>
        {(role === 'TEACHER' || role === 'ADMIN') && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add FAQ
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : faqs.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <HelpCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p>No FAQs available right now.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map(faq => {
            const isExpanded = expandedId === faq.id
            return (
              <div key={faq.id} className="glass-card faq-card" style={{ padding: 0, overflow: 'hidden', transition: 'all 0.3s' }}>
                <div
                  className="faq-header"
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                >
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: isExpanded ? 'var(--accent-purple)' : '#fff', transition: 'color 0.2s', margin: 0, paddingRight: 20 }}>{faq.question}</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Answered by {faq.teacher.name}</div>
                  </div>
                  <div>
                    {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="faq-content" style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ paddingTop: 20, fontSize: 15, lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {faq.answer}
                    </div>

                    {(faq.link || faq.videoUrl || faq.pdfUrl || faq.imageUrl) && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                        {faq.videoUrl && (
                          <a href={faq.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
                            <Video size={16} /> Watch Video Answer
                          </a>
                        )}
                        {faq.pdfUrl && (
                          <a href={faq.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
                            <ExternalLink size={16} /> View PDF
                          </a>
                        )}
                        {faq.imageUrl && (
                          <a href={faq.imageUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
                            <ExternalLink size={16} /> View Image
                          </a>
                        )}
                        {faq.link && (
                          <a href={faq.link} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
                            <ExternalLink size={16} /> Reference Link
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showCreate && <CreateFaqModal onClose={() => setShowCreate(false)} onCreated={loadFaqs} />}
    </div>
  )
}

function CreateFaqModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [link, setLink] = useState('')
  const [file, setFile] = useState<File | null>(null)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let videoUrl = null
      let pdfUrl = null
      let imageUrl = null

      if (file) {
        if (file.size > 50 * 1024 * 1024) throw new Error('File must be less than 50MB')
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'faq')

        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!upRes.ok) throw new Error('File upload failed')
        const upData = await upRes.json()

        if (file.type.startsWith('video/')) videoUrl = upData.url
        else if (file.type.startsWith('image/')) imageUrl = upData.url
        else if (file.type === 'application/pdf') pdfUrl = upData.url
        else throw new Error('Unsupported file type.')
      }

      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, link: link || null, videoUrl, pdfUrl, imageUrl }),
      })

      if (!res.ok) throw new Error('Failed to create FAQ')

      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.95)',
        zIndex: 9999,
        backdropFilter: 'blur(10px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '16px',
        display: 'block',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '600px',
          margin: '5vh auto',
          padding: '40px',
          position: 'relative',
          overflow: 'visible',
          background: '#000000',
          border: '2px solid rgba(239, 68, 68, 0.8)',
          boxShadow: '0 0 35px rgba(239, 68, 68, 0.4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h2 className="gradient-text" style={{ fontSize: 24, fontWeight: 800 }}>Add FAQ</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Create a new frequently asked question</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {error && <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', padding: 16, borderRadius: 12, fontSize: 14 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="label">Question *</label>
              <input className="input" placeholder="What is a candlestick?" value={question} onChange={e => setQuestion(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="label">Answer *</label>
              <textarea className="input" placeholder="A candlestick is..." rows={5} value={answer} onChange={e => setAnswer(e.target.value)} required style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="label">Reference Link (Optional)</label>
              <input className="input" type="url" placeholder="https://example.com" value={link} onChange={e => setLink(e.target.value)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label className="label">Upload File (Optional)</label>
              <div
                style={{ padding: '24px', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}
                onClick={() => document.getElementById('faq-video-upload')?.click()}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-purple)'
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                }}
              >
                <Video size={24} style={{ opacity: 0.5, marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500 }}>{file ? file.name : 'Click to select Video, PDF, or Image (max 50MB)'}</div>
                <input id="faq-video-upload" type="file" accept="video/*,application/pdf,image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" className="btn-secondary" style={{ padding: '10px 20px' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }} disabled={loading}>
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Create FAQ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
