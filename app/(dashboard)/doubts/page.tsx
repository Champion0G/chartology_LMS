'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Send, CheckCircle, Plus, X, Search, Filter, User, HelpCircle, ArrowRight, MessageSquareQuote } from 'lucide-react'

type Doubt = {
  id: string
  question: string
  reply: string | null
  status: 'OPEN' | 'RESOLVED'
  createdAt: string
  student?: { name: string; email: string }
}

export default function DoubtsPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAsk, setShowAsk] = useState(false)
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [replying, setReplying] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL')

  const load = useCallback(async () => {
    const [dRes, mRes] = await Promise.all([fetch('/api/doubts'), fetch('/api/me')])
    const [d, m] = await Promise.all([dRes.json(), mRes.json()])
    setDoubts(d)
    setRole(m.role || '')
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function submitDoubt(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await fetch('/api/doubts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    setQuestion('')
    setShowAsk(false)
    setSubmitting(false)
    load()
  }

  async function submitReply(id: string) {
    setReplying(true)
    await fetch(`/api/doubts/${id}/reply`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    })
    setReplyingId(null)
    setReply('')
    setReplying(false)
    load()
  }

  const filteredDoubts = doubts.filter(d => filter === 'ALL' || d.status === filter)

  if (loading) {
    return (
      <div className="fade-up">
        <div className="h-10 w-48 skeleton mb-8" />
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-[2rem]" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-up pb-20">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-headline text-4xl font-extrabold text-white tracking-tight mb-2">Q&A <span className="gradient-text">Forum.</span></h2>
          <p className="text-text-secondary text-lg">Direct access to educators for deep-dive clarification and scholarly doubt resolution.</p>
        </div>
        <div className="flex items-center gap-3">
          {role === 'STUDENT' && (
            <button className="btn-primary px-6 py-3 flex items-center gap-2 shadow-glow" onClick={() => setShowAsk(true)}>
              <Plus size={18} /> Ask Academic Query
            </button>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <section className="flex flex-col md:flex-row items-center gap-4 mb-10">
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-2xl">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-white/10 text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            All Threads
          </button>
          <button 
            onClick={() => setFilter('OPEN')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'OPEN' ? 'bg-accent-cyan/10 text-accent-cyan shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            Open ({doubts.filter(d => d.status === 'OPEN').length})
          </button>
          <button 
            onClick={() => setFilter('RESOLVED')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === 'RESOLVED' ? 'bg-accent-purple/10 text-accent-purple shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            Resolved
          </button>
        </div>
        <div className="hidden md:block h-8 w-px bg-white/5" />
        <div className="hidden md:flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-[0.2em]">
           <HelpCircle size={14} className="text-accent-cyan" />
           <span>Institutional Avg. Response: 4.2h</span>
        </div>
      </section>

      {/* Content Feed */}
      {filteredDoubts.length === 0 ? (
        <div className="glass-card p-20 text-center flex flex-col items-center gap-4 border-dashed border-white/10">
          <MessageCircle size={32} className="text-text-muted opacity-20" />
          <h3 className="text-white font-headline text-2xl font-bold">The forum is currently silent</h3>
          <p className="text-text-secondary max-w-xs">{role === 'STUDENT' ? 'Initiate a query to receive detailed scholarly feedback.' : 'Your students items are currently cleared.'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDoubts.map((d) => (
            <div key={d.id} className="glass-card p-0 overflow-hidden border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
              <div className="p-8 md:p-10">
                 {/* Thread Header */}
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-gradient p-0.5 shadow-glow">
                          <div className="w-full h-full rounded-full bg-bg-secondary flex items-center justify-center font-headline font-bold text-white text-xs">
                             {d.student?.name[0] || 'S'}
                          </div>
                       </div>
                       <div>
                          <div className="text-white font-bold text-sm tracking-tight">{d.student?.name} <span className="text-text-muted font-normal ml-1">Archive {d.id.slice(-4).toUpperCase()}</span></div>
                          <div className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mt-0.5">{new Date(d.createdAt).toLocaleString()}</div>
                       </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      d.status === 'OPEN' ? 'bg-accent-cyan-dim text-accent-cyan border-accent-cyan/20' : 'bg-accent-purple-dim text-accent-purple border-accent-purple/20'
                    }`}>
                      {d.status} {d.status === 'RESOLVED' && '— TIER 1'}
                    </span>
                 </div>

                 {/* Question Content */}
                 <div className="flex gap-6 mb-8 group/query">
                    <div className="hidden md:flex flex-col items-center gap-2">
                       <div className="w-0.5 h-full bg-white/5 rounded-full" />
                    </div>
                    <div className="flex-1">
                       <h3 className="text-white text-lg md:text-xl font-medium leading-relaxed font-headline">{d.question}</h3>
                    </div>
                 </div>

                 {/* Teacher Reply Section */}
                 {d.reply && (
                    <div className="mt-8 pt-8 border-t border-white/5 bg-accent-purple-dim/5 -mx-8 -mb-8 px-8 pb-8 rounded-b-[2rem]">
                       <div className="flex gap-6">
                          <div className="w-10 h-10 rounded-full bg-bg-secondary border border-accent-purple/30 flex items-center justify-center text-accent-purple flex-shrink-0 animate-pulse-glow">
                             <Sparkles size={20} />
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-bold text-accent-purple uppercase tracking-[0.2em]">Institutional Resolution</span>
                                <div className="h-px flex-1 bg-accent-purple/10" />
                                <CheckCircle size={14} className="text-accent-purple" />
                             </div>
                             <p className="text-text-secondary text-sm md:text-md italic leading-relaxed">"{d.reply}"</p>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Action Bar (Teachers) */}
                 {(role === 'TEACHER' || role === 'ADMIN') && d.status === 'OPEN' && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                      {replyingId === d.id ? (
                        <div className="animate-fade-in space-y-4">
                          <textarea 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-accent-purple transition-all italic leading-relaxed" 
                            rows={3} 
                            placeholder="Provide detailed scholarly resolution..." 
                            value={reply} 
                            onChange={e => setReply(e.target.value)} 
                          />
                          <div className="flex justify-end gap-3">
                            <button className="text-text-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest" onClick={() => setReplyingId(null)}>Abandon</button>
                            <button className="text-accent-purple hover:underline transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2" onClick={() => submitReply(d.id)} disabled={replying || !reply.trim()}>
                              {replying ? 'Transmitting...' : 'Commit & Resolve'} <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="btn-secondary px-6 py-3 rounded-xl flex items-center gap-2 group/btn" 
                          onClick={() => setReplyingId(d.id)}
                        >
                          <Send size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /> Reply to Thread
                        </button>
                      )}
                    </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ask Modal */}
      {showAsk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md" onClick={() => setShowAsk(false)} />
          <div className="relative w-full max-w-2xl bg-bg-secondary border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="font-headline text-3xl font-extrabold text-white tracking-tight mb-2">New <span className="gradient-text">Academic Query.</span></h2>
                  <p className="text-text-secondary text-sm">Initiate a formal thread for doubt resolution.</p>
                </div>
                <button onClick={() => setShowAsk(false)} className="p-2 text-text-muted hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={submitDoubt} className="space-y-8">
                <div className="group">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 group-focus-within:text-accent-cyan transition-colors">Query Narrative</label>
                  <div className="relative">
                     <MessageSquareQuote className="absolute left-6 top-6 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={20} />
                     <textarea
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 pt-6 pb-6 text-white focus:outline-none focus:border-accent-cyan focus:bg-white/10 transition-all text-sm leading-relaxed" 
                        rows={6}
                        placeholder="Describe your academic hurdle with precision..."
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        required
                      />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" className="flex-1 btn-secondary py-4 rounded-2xl uppercase tracking-widest font-bold text-xs" onClick={() => setShowAsk(false)}>Abandon</button>
                  <button type="submit" className="flex-[2] btn-primary py-4 rounded-2xl uppercase tracking-widest font-bold text-xs shadow-glow" disabled={submitting || !question.trim()}>
                    {submitting ? 'Transmitting Data...' : 'Confirm Submission'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  )
}

function Sparkles({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
