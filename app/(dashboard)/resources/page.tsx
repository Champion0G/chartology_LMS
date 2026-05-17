'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, Play, Plus, X, ExternalLink, Loader2 } from 'lucide-react'

type Resource = {
  id: string
  title: string
  videoUrl?: string | null
  pdfUrl?: string | null
  imageUrl?: string | null
  description: string
  createdAt: string
}

function getYoutubeThumbnail(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (match) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`
  return null
}

function getYoutubeEmbed(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}`
  return url
}

function renderPlayer(resource: Resource) {
  if (resource.videoUrl) {
    const ytRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    if (ytRegex.test(resource.videoUrl)) {
      return (
        <iframe
          src={getYoutubeEmbed(resource.videoUrl)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
        />
      )
    }
    return <video src={resource.videoUrl} controls style={{ width: '100%', height: '100%', borderRadius: 8, outline: 'none', background: '#000' }} />
  } else if (resource.pdfUrl) {
    return <iframe src={resource.pdfUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }} />
  } else if (resource.imageUrl) {
    return <img src={resource.imageUrl} alt={resource.title} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
  }
  return null
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const load = useCallback(async () => {
    const [rRes, mRes] = await Promise.all([fetch('/api/resources'), fetch('/api/me')])
    const [r, m] = await Promise.all([rRes.json(), mRes.json()])
    setResources(r)
    setRole(m.role || '')
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const playing = resources.find(r => r.id === playingId)

  if (loading) {
    return (
      <div className="fade-up">
        <h1 className="page-title" style={{ marginBottom: 28 }}>Resources</h1>
        <div className="resources-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 12 }} />)}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fade-up">
        <div className="page-header">
          <div>
            <h1 className="page-title">Resources</h1>
            <p className="page-sub">{resources.length} video{resources.length !== 1 ? 's' : ''} available</p>
          </div>
          {(role === 'TEACHER' || role === 'ADMIN') && resources.length < 10 && (
            <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Add Resource
            </button>
          )}
        </div>

        {resources.length === 0 ? (
          <div className="empty-state glass-card">
            <BookOpen size={32} style={{ opacity: 0.3 }} />
            <p>No resources added yet.</p>
          </div>
        ) : (
          <div className="resources-grid">
            {resources.map((r) => {
              const thumb = r.videoUrl ? getYoutubeThumbnail(r.videoUrl) : r.imageUrl ? r.imageUrl : null
              return (
                <div key={r.id} className="resource-card glass-card" onClick={() => setPlayingId(r.id)}>
                  <div className="resource-thumb" style={{ backgroundImage: thumb ? `url(${thumb})` : undefined }}>
                    {!thumb && <BookOpen size={32} style={{ opacity: 0.3 }} />}
                    <div className="play-overlay">
                      <div className="play-btn"><Play size={22} fill="white" /></div>
                    </div>
                  </div>
                  <div className="resource-info">
                    <div className="resource-title">{r.title}</div>
                    {r.description && <div className="resource-desc">{r.description}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Video View Modal */}
      {playing && (
        <div className="modal-overlay" onClick={() => setPlayingId(null)}>
          <div className="video-modal" onClick={e => e.stopPropagation()}>
            <div className="video-modal-header">
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>{playing.title}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href={playing.videoUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ExternalLink size={13} /> Open
                </a>
                <button onClick={() => setPlayingId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>
            </div>
            <div className="video-container">
              {renderPlayer(playing)}
            </div>
            {playing.description && <p style={{ padding: '12px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>{playing.description}</p>}
          </div>
        </div>
      )}

      {/* Add Resource Modal (Full Screen Breakout) */}
      {showAdd && <AddResourceModal onClose={() => setShowAdd(false)} onAdded={load} />}

      <style jsx>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        .page-title { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
        .page-sub { color: var(--text-muted); font-size: 14px; }
        .resources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .resource-card { cursor: pointer; overflow: hidden; padding: 0; }
        .resource-thumb {
          height: 160px; background: var(--bg-secondary); background-size: cover; background-position: center;
          position: relative; display: flex; align-items: center; justify-content: center;
        }
        .play-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
        }
        .resource-card:hover .play-overlay { opacity: 1; }
        .play-btn {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(139, 92, 246, 0.9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .resource-info { padding: 14px 16px; }
        .resource-title { font-size: 14px; font-weight: 600; line-height: 1.4; }
        .resource-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        .empty-state { padding: 48px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; color: var(--text-muted); font-size: 14px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
        .video-modal { width: 100%; max-width: 840px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin: 16px; }
        .video-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .video-container { aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; }
      `}</style>
    </>
  )
}

function AddResourceModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [title, setTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      let finalVideoUrl = videoUrl
      let finalPdfUrl = ''
      let finalImageUrl = ''

      if (file) {
        if (file.size > 50 * 1024 * 1024) throw new Error('File must be less than 50MB')
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', 'resource')
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!upRes.ok) throw new Error('File upload failed')
        const upData = await upRes.json()
        
        if (file.type.startsWith('video/')) finalVideoUrl = upData.url
        else if (file.type.startsWith('image/')) finalImageUrl = upData.url
        else if (file.type === 'application/pdf') finalPdfUrl = upData.url
        else throw new Error('Unsupported file type. Please upload a Video, PDF, or Image.')
      }

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, videoUrl: finalVideoUrl || null, pdfUrl: finalPdfUrl || null, imageUrl: finalImageUrl || null, description }),
      })
      if (!res.ok) throw new Error('Failed to create resource')
      
      onAdded()
      onClose()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return createPortal((
    <div className="modal-overlay">
      <div className="modal glass-card">
        <div className="modal-header">
          <h2>Add Resource</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', padding: 16, borderRadius: 12, fontSize: 14 }}>{error}</div>}
            
            <div>
              <label className="label">Title</label>
              <input className="input" placeholder="e.g. Introduction to Technical Analysis" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            
            <div>
              <label className="label">YouTube Link</label>
              <input className="input" type="url" placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={e => {setVideoUrl(e.target.value); setFile(null)}} disabled={!!file} />
            </div>

            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>OR</div>

            <div>
               <label className="label">Upload File directly (max 50MB) - Video, PDF, Image</label>
               <div 
                 className={`upload-area ${videoUrl ? 'disabled' : ''}`}
                 onClick={() => { if (!videoUrl) document.getElementById('res-video-upload')?.click() }}
               >
                 <Play size={20} style={{ opacity: 0.5 }} />
                 <div style={{ fontSize: 15, fontWeight: 500 }}>{file ? file.name : 'Click to select a file'}</div>
                 <input id="res-video-upload" type="file" accept="video/*,application/pdf,image/*" style={{ display: 'none' }} onChange={e => {if (e.target.files?.[0]) {setFile(e.target.files[0]); setVideoUrl('');}}} />
               </div>
            </div>

            <div>
              <label className="label">Description (optional)</label>
              <textarea className="input" placeholder="Briefly describe what this resource covers..." rows={3} value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn-secondary" style={{ padding: '12px 24px' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '12px 32px' }} disabled={loading}>
                {loading ? <Loader2 size={20} className="spinner" /> : 'Create Resource'}
              </button>
            </div>
          </form>
      </div>
      
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; backdrop-filter: blur(4px); overflow-y: auto; overflow-x: hidden; padding: 16px; display: flex; align-items: flex-start; justify-content: center; }
        .modal { width: 100%; max-width: 560px; margin: 5vh auto; padding: 28px 24px; border-radius: var(--radius-lg); transition: all 0.3s ease; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h2 { font-size: 18px; line-height: 1.2; }
        .upload-area {
          border: 1px dashed var(--border-accent); border-radius: var(--radius-sm);
          padding: 16px; display: flex; align-items: center; gap: 10px;
          cursor: pointer; color: var(--text-muted); font-size: 13px;
          transition: border-color 0.2s, background 0.2s;
        }
        .upload-area:hover { border-color: var(--accent-purple); background: var(--accent-purple-dim); }
        .upload-area.disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  ), document.body)
}
