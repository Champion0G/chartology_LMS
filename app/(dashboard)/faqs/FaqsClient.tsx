'use client'

import { useState, useEffect, useCallback } from 'react'
import { HelpCircle, Plus, X, Video, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

type Faq = {
  id: string
  question: string
  answer: string
  videoUrl: string | null
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
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
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
                    
                    {(faq.link || faq.videoUrl) && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                        {faq.videoUrl && (
                          <a href={faq.videoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, textDecoration: 'none' }}>
                            <Video size={16} /> Watch Video Answer
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      let videoUrl = null

      if (file) {
        if (file.size > 50 * 1024 * 1024) throw new Error('Video must be less than 50MB')
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'faq')
        
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!upRes.ok) throw new Error('Video upload failed')
        const upData = await upRes.json()
        videoUrl = upData.url
      }

      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, link: link || null, videoUrl }),
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
    <div className="modal-breakout-overlay">
      <div className="modal-fullscreen-content">
        <div className="modal-fullscreen-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <div>
              <h2 className="gradient-text" style={{ fontSize: 36, fontWeight: 800 }}>Add FAQ</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 4 }}>Create a new frequently asked question for your students</p>
            </div>
            <button onClick={onClose} className="close-btn-breakout" title="Close"><X size={28} /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {error && <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', padding: 16, borderRadius: 12, fontSize: 14 }}>{error}</div>}
            
            <div className="form-group-fullscreen">
              <label className="label">Question *</label>
              <input className="input" placeholder="What is a candlestick?" value={question} onChange={e => setQuestion(e.target.value)} required />
            </div>
            
            <div className="form-group-fullscreen">
              <label className="label">Answer *</label>
              <textarea className="input" placeholder="A candlestick is..." rows={5} value={answer} onChange={e => setAnswer(e.target.value)} required style={{ resize: 'vertical' }} />
            </div>
            
            <div className="form-group-fullscreen">
              <label className="label">Reference Link (Optional)</label>
              <input className="input" type="url" placeholder="https://example.com" value={link} onChange={e => setLink(e.target.value)} />
            </div>

            <div className="form-group-fullscreen">
              <label className="label">Video Answer (Optional)</label>
              <div 
                className="upload-zone"
                onClick={() => document.getElementById('faq-video-upload')?.click()}
              >
                <Video size={32} style={{ opacity: 0.5, marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 500 }}>{file ? file.name : 'Click to select a video file (max 50MB)'}</div>
                <input id="faq-video-upload" type="file" accept="video/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn-secondary" style={{ padding: '12px 24px' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '12px 32px' }} disabled={loading}>
                {loading ? <Loader2 size={20} className="spinner" /> : 'Create FAQ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .modal-breakout-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--bg-primary); z-index: 999999; overflow-y: auto; overflow-x: hidden; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .modal-fullscreen-content { width: 100%; max-width: 900px; position: relative; }
        .close-btn-breakout { position: fixed; top: 40px; right: 40px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-muted); padding: 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; z-index: 1000000; }
        .close-btn-breakout:hover { background: rgba(239, 68, 68, 0.1); color: var(--danger); border-color: var(--danger-dim); }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .upload-zone { padding: 32px; border: 2px dashed var(--border); border-radius: 16px; text-align: center; cursor: pointer; background: rgba(255,255,255,0.02); transition: all 0.2s; }
        .upload-zone:hover { border-color: var(--accent-purple); background: rgba(139, 92, 246, 0.05); }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
          .modal-breakout-overlay { padding: 20px; align-items: flex-start; }
          .close-btn-breakout { top: 20px; right: 20px; padding: 10px; }
        }
      `}</style>
    </div>
  )
}
