'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Play, Plus, X, ExternalLink, Search, Filter, LayoutGrid, Clock, User, Sparkles } from 'lucide-react'

type Resource = {
  id: string
  title: string
  videoUrl: string
  description: string
  createdAt: string
}

function getYoutubeThumbnail(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
  return null
}

function getYoutubeEmbed(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&modestbranding=1&rel=0`
  return url
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    const [rRes, mRes] = await Promise.all([fetch('/api/resources'), fetch('/api/me')])
    const [r, m] = await Promise.all([rRes.json(), mRes.json()])
    setResources(r)
    setRole(m.role || '')
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const playing = resources.find(r => r.id === playingId)
  const filteredResources = resources.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) {
    return (
      <div className="fade-up">
        <div className="h-10 w-48 skeleton mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton h-60 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up pb-20">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-headline text-4xl font-extrabold text-white tracking-tight mb-2">Resource <span className="gradient-text">Vault.</span></h2>
          <p className="text-text-secondary text-lg">Access the central library of instructional modules and video lessons.</p>
        </div>
        <div className="flex items-center gap-3">
          {(role === 'TEACHER' || role === 'ADMIN') && (
            <button className="btn-primary px-6 py-3 flex items-center gap-2 shadow-glow" onClick={() => setShowAdd(true)}>
              <Plus size={18} /> Provision Resource
            </button>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <section className="flex flex-col md:flex-row items-center gap-4 mb-10">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search the library for curriculum keys..." 
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent-cyan/30 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-2xl self-stretch">
             <button className="p-3 rounded-xl bg-white/10 text-accent-cyan shadow-lg"><LayoutGrid size={20} /></button>
           </div>
           <button className="btn-secondary h-full py-4 px-6 flex items-center gap-2 rounded-2xl border-white/10">
             <Filter size={18} /> Filter List
           </button>
        </div>
      </section>

      {/* Content Grid */}
      {filteredResources.length === 0 ? (
        <div className="glass-card p-20 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-muted mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-white font-headline text-2xl font-bold">The vault is currently silent</h3>
          <p className="text-text-secondary max-w-xs">No resources match your query. Try broadening your terms or request a new archive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((r) => {
            const thumb = getYoutubeThumbnail(r.videoUrl)
            return (
              <div 
                key={r.id} 
                className="glass-card p-0 group cursor-pointer hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                onClick={() => setPlayingId(r.id)}
              >
                <div className="relative aspect-video bg-white/5 overflow-hidden">
                   {thumb ? (
                     <img src={thumb} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-text-muted opacity-20">
                       <BookOpen size={48} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-14 h-14 rounded-full bg-white text-bg-primary flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                         <Play size={24} fill="currentColor" />
                      </div>
                   </div>
                   <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                      <span className="px-2 py-1 rounded-md bg-black/40 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">Archive C-{r.id.slice(-2).toUpperCase()}</span>
                      <div className="flex items-center gap-1.5 text-white/60">
                         <Clock size={12} />
                         <span className="text-[10px] font-bold">12:45</span>
                      </div>
                   </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                     <Sparkles size={14} className="text-accent-cyan" />
                     <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest leading-none">Core Curriculum</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-accent-cyan transition-colors">{r.title}</h3>
                  <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed mb-6">{r.description || 'Access the essential keys to mastery in this archival module.'}</p>
                  
                  <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] border-t border-white/5 pt-6">
                     <div className="flex items-center gap-2">
                        <User size={14} className="text-accent-purple" />
                        <span>Educator Hub</span>
                     </div>
                     <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Video Modal: Theater View */}
      {playing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-fade-in" onClick={() => setPlayingId(null)}>
          <div className="absolute inset-0 bg-bg-primary/95 backdrop-blur-xl" />
          <div className="relative w-full max-w-6xl bg-bg-secondary border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-[0.2em] mb-2 block">Curator Interactive View</span>
                <h2 className="font-headline text-2xl font-bold text-white leading-none">{playing.title}</h2>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href={playing.videoUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hidden md:flex items-center gap-2 text-text-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl"
                >
                  <ExternalLink size={14} /> Open Repository
                </a>
                <button 
                  onClick={() => setPlayingId(null)} 
                  className="p-2 text-text-muted hover:bg-white/5 hover:text-white rounded-full transition-all"
                >
                  <X size={28} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-10">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 relative group">
                <iframe
                  src={getYoutubeEmbed(playing.videoUrl)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-none shadow-glow"
                />
              </div>
              
              <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-2">
                    <h3 className="font-headline text-xl font-bold text-white mb-4">Strategic Summary</h3>
                    <p className="text-text-secondary leading-relaxed text-lg italic pr-12">{playing.description || 'No detailed strategic brief provided for this archival module.'}</p>
                 </div>
                 <div className="space-y-8">
                    <div>
                       <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Module Attributes</h4>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-text-muted">Type</span>
                             <span className="text-white font-bold">Video Core</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-text-muted">Stability</span>
                             <span className="text-success font-bold font-headline tracking-widest uppercase text-[10px]">VERIFIED</span>
                          </div>
                       </div>
                    </div>
                    <button className="w-full btn-primary py-4 rounded-2xl uppercase tracking-widest font-bold text-xs" onClick={() => setPlayingId(null)}>Close Content Hub</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && <AddResourceModal onClose={() => setShowAdd(false)} onAdded={load} />}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-bg-secondary border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-white tracking-tight mb-2">Provision <span className="gradient-text">Archive.</span></h2>
              <p className="text-text-secondary text-sm">Seal a new curriculum video into the repository.</p>
            </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="group">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 group-focus-within:text-accent-cyan transition-colors">Archive Key (Title)</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-cyan transition-all font-headline font-bold" 
                placeholder="Unit Omega: Data Structures..."
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 group-focus-within:text-accent-cyan transition-colors">Core Source (URL)</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-cyan transition-all font-headline font-bold" 
                type="url" 
                placeholder="https://youtube.com/watch?v=..." 
                value={videoUrl} 
                onChange={e => setVideoUrl(e.target.value)} 
                required 
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 group-focus-within:text-accent-cyan transition-colors">Strategic Brief</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-cyan transition-all text-sm leading-relaxed" 
                rows={3}
                placeholder="Optional instructional nodes..."
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" className="flex-1 btn-secondary py-4 rounded-2xl uppercase tracking-widest font-bold text-xs" onClick={onClose}>Abandon</button>
              <button type="submit" className="flex-[2] btn-primary py-4 rounded-2xl uppercase tracking-widest font-bold text-xs shadow-glow" disabled={loading}>
                {loading ? 'Committing Archive...' : 'Confirm Provisioning'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
