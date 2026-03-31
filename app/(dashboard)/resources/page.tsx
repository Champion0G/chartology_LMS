'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Play, Plus, X, ExternalLink } from 'lucide-react'

type Resource = {
  id: string
  title: string
  videoUrl: string
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
            const thumb = getYoutubeThumbnail(r.videoUrl)
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

      {/* Video Modal */}
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
              <iframe
                src={getYoutubeEmbed(playing.videoUrl)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
              />
            </div>
            {playing.description && <p style={{ padding: '12px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>{playing.description}</p>}
          </div>
        </div>
      )}

      {/* Add Modal */}
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
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, videoUrl, description }),
    })
    setLoading(false)
    onAdded()
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18 }}>Add Resource</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label className="label">Title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><label className="label">YouTube / Video URL</label><input className="input" type="url" placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required /></div>
          <div><label className="label">Description (optional)</label><input className="input" value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Resource'}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; backdrop-filter: blur(4px); overflow-y: auto; overflow-x: hidden; padding: 16px; }
        .modal { width: 100%; max-width: 480px; margin: 10vh auto; padding: 28px 24px; border-radius: var(--radius-lg); transition: all 0.3s ease; }
        .modal:hover { transform: translateY(-4px); }
      `}</style>
    </div>
  )
}
