'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, Plus, FileText, Clock, CheckCircle, ChevronDown, ChevronUp, ChevronRight, X, ExternalLink, Search, Filter, Calendar, User, LayoutGrid, List } from 'lucide-react'

type Assignment = {
  id: string
  title: string
  description: string
  deadline: string
  fileUrl?: string | null
  fileName?: string | null
  teacher?: { name: string }
  _count?: { submissions: number }
  submission?: { grade: number | null; submittedAt: string; feedback?: string | null } | null
}

type Submission = {
  id: string
  studentId: string
  fileUrl: string
  fileName: string
  submittedAt: string
  isLate: boolean
  grade: number | null
  feedback: string | null
  student?: { name: string; email: string }
  assignment?: { title: string }
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async () => {
    const [aRes, sRes] = await Promise.all([
      fetch('/api/assignments'),
      fetch('/api/submissions'),
    ])
    const [a, s] = await Promise.all([aRes.json(), sRes.json()])
    setAssignments(a)
    setSubmissions(s)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    fetch('/api/me').then(r => r.json()).then(d => setRole(d.role || '')).catch(() => {})
  }, [load])

  function getStatus(deadline: string, submission: any) {
    if (submission) return { label: 'Submitted', color: 'cyan', icon: <CheckCircle size={14} /> }
    const d = new Date(deadline)
    const diff = d.getTime() - new Date().getTime()
    if (diff < 0) return { label: 'Overdue', color: 'danger', icon: <Clock size={14} /> }
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days <= 2) return { label: `${days}d left`, color: 'warning', icon: <Clock size={14} /> }
    return { label: 'Active', color: 'success', icon: <Calendar size={14} /> }
  }

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.teacher?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="fade-up">
        <div className="h-10 w-48 skeleton mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton h-64 rounded-3xl" />
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
          <h2 className="font-headline text-4xl font-extrabold text-white tracking-tight mb-2">Vault & <span className="gradient-text">Assignments.</span></h2>
          <p className="text-text-secondary text-lg">Manage your academic milestones and review curriculum tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          {(role === 'TEACHER' || role === 'ADMIN') && (
            <button className="btn-primary px-6 py-3 flex items-center gap-2" onClick={() => setShowCreate(true)}>
              <Plus size={18} /> New Module
            </button>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <section className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search assignments or educators..." 
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-accent-cyan/30 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-2xl self-stretch">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-accent-cyan shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-accent-cyan shadow-lg' : 'text-text-muted hover:text-white'}`}
          >
            <List size={20} />
          </button>
        </div>
        <button className="btn-secondary h-full py-4 px-6 flex items-center gap-2 rounded-2xl border-white/10">
          <Filter size={18} /> Filter
        </button>
      </section>

      {/* Grid View */}
      {filteredAssignments.length === 0 ? (
        <div className="glass-card p-20 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-muted mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-white font-headline text-2xl font-bold">No matches found</h3>
          <p className="text-text-secondary max-w-xs">Relax your search criteria or explore other tabs to find what you're looking for.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredAssignments.map((a) => {
            const status = getStatus(a.deadline, a.submission)
            const isExpanded = expandedId === a.id
            const assignmentSubs = submissions.filter((s) => 'assignmentId' in s ? (s as { assignmentId?: string }).assignmentId === a.id : s.assignment?.title === a.title)

            return viewMode === 'grid' ? (
              <div key={a.id} className="glass-card p-0 group flex flex-col h-full hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                <div className="h-40 bg-white/[0.02] relative border-b border-white/5 flex items-center justify-center">
                   <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md border ${
                     status.color === 'cyan' ? 'bg-accent-cyan-dim text-accent-cyan border-accent-cyan/20' : 
                     status.color === 'danger' ? 'bg-danger-dim text-danger border-danger/20' : 
                     status.color === 'warning' ? 'bg-warning-dim text-warning border-warning/20' : 
                     'bg-success-dim text-success border-success/20'
                   }`}>
                     {status.icon} {status.label}
                   </div>
                   <div className="absolute inset-0 bg-gradient opacity-0 group-hover:opacity-10 transition-opacity" />
                   <FileText size={48} className="text-accent-cyan opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">Module A-{a.id.slice(-2).toUpperCase()}</span>
                    <h3 className="font-headline text-xl font-bold text-white group-hover:text-accent-cyan transition-colors line-clamp-1">{a.title}</h3>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed mb-8 line-clamp-2">{a.description}</p>
                  
                  <div className="mt-auto space-y-6">
                    <div className="flex items-center justify-between text-xs font-bold text-text-muted uppercase tracking-widest">
                       <div className="flex items-center gap-2">
                          <User size={14} className="text-accent-purple" />
                          <span>{a.teacher?.name || 'Academic Core'}</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          <span>{new Date(a.deadline).toLocaleDateString()}</span>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : a.id)}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        isExpanded ? 'bg-white/10 text-white' : 'btn-secondary border-white/5'
                      }`}
                    >
                      {role === 'TEACHER' ? 'Manage Inbox' : isExpanded ? 'Close Focus' : 'Engage Content'}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expansion Area */}
                  {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-white/5 animate-fade-in">
                       {a.fileUrl && (
                         <a href={a.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all mb-6 group/file">
                           <div className="w-10 h-10 rounded-lg bg-accent-purple-dim text-accent-purple flex items-center justify-center">
                             <ExternalLink size={20} />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="text-white font-bold text-sm truncate">{a.fileName || 'Reference Material'}</div>
                             <div className="text-text-muted text-[10px] tracking-widest uppercase mt-0.5">Reference Document</div>
                           </div>
                         </a>
                       )}

                       {role === 'STUDENT' && !a.submission && (
                         <div className="space-y-4">
                            <SubmitForm assignmentId={a.id} onSubmit={load} />
                         </div>
                       )}

                       {role === 'STUDENT' && a.submission && (
                         <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-success-dim border border-success/20 text-success">
                               <CheckCircle size={20} />
                               <div>
                                  <div className="font-bold text-sm uppercase tracking-widest">Submission Verified</div>
                                  <div className="text-xs opacity-80">{new Date(a.submission.submittedAt).toLocaleString()}</div>
                               </div>
                            </div>
                            {a.submission.feedback && (
                              <div className="p-5 rounded-2xl bg-white/5 border-l-4 border-accent-purple">
                                <div className="text-[10px] font-bold text-accent-purple uppercase tracking-widest mb-2 font-headline">Evaluation Feedback</div>
                                <p className="text-sm text-text-secondary italic leading-relaxed">"{a.submission.feedback}"</p>
                              </div>
                            )}
                         </div>
                       )}

                       {(role === 'TEACHER' || role === 'ADMIN') && (
                         <SubmissionsList submissions={assignmentSubs} onGrade={load} />
                       )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* List Item View */
              <div key={a.id} className="glass-card p-6 flex flex-col gap-6 group hover:translate-x-1 transition-all">
                <div className="flex items-center justify-between gap-6" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                   <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent-cyan flex-shrink-0">
                         <FileText size={24} />
                      </div>
                      <div className="min-w-0">
                         <h3 className="font-headline font-bold text-white group-hover:text-accent-cyan transition-colors truncate">{a.title}</h3>
                         <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                            <span className="flex items-center gap-1.5"><User size={12} /> {a.teacher?.name}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(a.deadline).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
                         status.color === 'cyan' ? 'bg-accent-cyan-dim text-accent-cyan border-accent-cyan/20' : 
                         status.color === 'danger' ? 'bg-danger-dim text-danger border-danger/20' : 
                         status.color === 'warning' ? 'bg-warning-dim text-warning border-warning/20' : 
                         'bg-success-dim text-success border-success/20'
                      }`}>
                         {status.label}
                      </span>
                      <ChevronDown size={20} className={`text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                   </div>
                </div>
                
                {isExpanded && (
                  <div className="pt-6 border-t border-white/5 animate-fade-in">
                     <p className="text-text-secondary text-sm mb-6 max-w-2xl leading-relaxed">{a.description}</p>
                     <div className="flex flex-wrap gap-4">
                        {a.fileUrl && (
                           <a href={a.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary px-6 py-3 flex items-center gap-2">
                              <ExternalLink size={16} /> Reference Material
                           </a>
                        )}
                        {role === 'STUDENT' && !a.submission ? (
                           <SubmitForm assignmentId={a.id} onSubmit={load} />
                        ) : role === 'STUDENT' && a.submission ? (
                           <div className="text-success font-bold text-sm flex items-center gap-2 bg-success-dim px-4 py-2 rounded-xl">
                              <CheckCircle size={16} /> Submitted
                           </div>
                        ) : null}
                     </div>
                     {(role === 'TEACHER' || role === 'ADMIN') && (
                       <div className="mt-8">
                         <SubmissionsList submissions={assignmentSubs} onGrade={load} />
                       </div>
                     )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showCreate && <CreateAssignmentModal onClose={() => setShowCreate(false)} onCreated={load} />}
      
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  )
}

function SubmitForm({ assignmentId, onSubmit }: { assignmentId: string; onSubmit: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('file', file)
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!upRes.ok) throw new Error('Upload failed')
      const { url, name } = await upRes.json()

      const subRes = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, fileUrl: url, fileName: name }),
      })
      if (!subRes.ok) {
        const d = await subRes.json()
        throw new Error(d.error)
      }
      onSubmit()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {error && <div className="p-3 bg-danger-dim border border-danger/20 rounded-xl text-danger text-xs mb-4">{error}</div>}
      <div 
        className="w-full p-8 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/2 hover:bg-white/5 hover:border-accent-cyan/30 transition-all cursor-pointer flex flex-col items-center gap-3 group text-center"
        onClick={() => document.getElementById(`file-${assignmentId}`)?.click()}
      >
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-text-muted group-hover:text-accent-cyan transition-colors">
           <Upload size={24} />
        </div>
        <div>
           <div className="text-white font-bold text-sm mb-1">{file ? file.name : 'Curriculum Submission'}</div>
           <p className="text-text-muted text-xs">Maximum institutional limit: 10MB per unit.</p>
        </div>
        <input id={`file-${assignmentId}`} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>
      <button 
        type="submit" 
        className="w-full btn-primary py-4 rounded-2xl mt-6 font-headline font-extrabold uppercase tracking-widest text-xs" 
        disabled={!file || loading}
      >
        {loading ? 'Transmitting Data...' : 'Confirm Submission'}
      </button>
    </form>
  )
}

function SubmissionsList({ submissions, onGrade }: { submissions: Submission[]; onGrade: () => void }) {
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  if (submissions.length === 0) {
    return (
      <div className="bg-white/2 border border-white/5 p-8 rounded-2xl text-center">
        <Clock size={32} className="mx-auto text-text-muted opacity-20 mb-4" />
        <p className="text-text-muted text-sm italic font-medium">Monitoring track... No submissions received.</p>
      </div>
    )
  }

  async function saveGrade(id: string) {
    setSaving(true)
    await fetch(`/api/submissions/${id}/grade`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: parseInt(grade), feedback }),
    })
    setGradingId(null)
    setGrade('')
    setFeedback('')
    setSaving(false)
    onGrade()
  }

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-bold text-accent-cyan uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
         <span>Received Inbox</span>
         <span className="bg-accent-cyan/10 px-2 py-0.5 rounded">{submissions.length} Units</span>
      </div>
      {submissions.map((s) => (
        <div key={s.id} className="glass-card p-6 bg-white/[0.03] border-white/5 rounded-3xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-gradient p-0.5">
                  <div className="w-full h-full rounded-full bg-bg-secondary flex items-center justify-center font-bold text-xs text-white">
                    {s.student?.name[0]}
                  </div>
               </div>
               <div>
                  <div className="font-headline font-bold text-white text-sm">{s.student?.name}</div>
                  <div className="text-[10px] text-text-muted flex items-center gap-2 font-bold uppercase tracking-widest mt-0.5">
                    {new Date(s.submittedAt).toLocaleDateString()}
                    {s.isLate && <span className="text-danger flex items-center gap-1"><Clock size={10} /> LATE</span>}
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={s.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary p-3 rounded-xl hover:text-accent-cyan transition-colors" title="Review Submission">
                <ExternalLink size={20} />
              </a>
              {s.grade !== null && s.grade !== undefined ? (
                <div className={`p-3 rounded-xl font-headline font-extrabold text-sm min-w-[54px] text-center ${s.grade >= 80 ? 'bg-success-dim text-success' : s.grade >= 50 ? 'bg-warning-dim text-warning' : 'bg-danger-dim text-danger'}`}>
                  {s.grade}%
                </div>
              ) : (
                <button 
                  className="btn-primary py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-widest" 
                  onClick={() => setGradingId(s.id)}
                >
                  Evaluate
                </button>
              )}
            </div>
          </div>

          {gradingId === s.id && (
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="md:col-span-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Grade %</label>
                    <input type="number" min={0} max={100} placeholder="88" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-cyan outline-none" value={grade} onChange={e => setGrade(e.target.value)} />
                 </div>
                 <div className="md:col-span-3">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Evaluator Remarks</label>
                    <input type="text" placeholder="Exceptional depth in unit analysis..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent-cyan outline-none" value={feedback} onChange={e => setFeedback(e.target.value)} />
                 </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button className="text-text-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest" onClick={() => setGradingId(null)}>Abandon</button>
                <button className="text-accent-cyan hover:underline transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2" onClick={() => saveGrade(s.id)} disabled={!grade || saving}>
                  {saving ? 'Transmitting...' : 'Commit Evaluation'} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function CreateAssignmentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      let fileUrl = null
      let fileName = null

      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!upRes.ok) throw new Error('File upload failed. Please try a smaller file.')
        const upData = await upRes.json()
        fileUrl = upData.url
        fileName = upData.name
      }

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, deadline, fileUrl, fileName }),
      })
      
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to create assignment')
      }
      
      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-primary/95 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-bg-secondary border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="font-headline text-3xl font-extrabold text-white tracking-tight mb-2">New <span className="gradient-text">Curriculum Module.</span></h2>
              <p className="text-text-secondary text-sm">Provision a new academic task for the current student roster.</p>
            </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="p-4 bg-danger-dim border border-danger/20 rounded-2xl text-danger text-sm">{error}</div>}
            
            <div className="group">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 group-focus-within:text-accent-cyan transition-colors">Module Designation</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-cyan focus:bg-white/10 transition-all font-headline font-bold" 
                placeholder="Advanced Unit: Algorithmic Logic..."
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 group-focus-within:text-accent-cyan transition-colors">Strategic Brief</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-cyan focus:bg-white/10 transition-all text-sm leading-relaxed" 
                rows={4} 
                placeholder="Detailed objectives, constraints, and success criteria..."
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="group">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 group-focus-within:text-accent-cyan transition-colors">Timeline Deadline</label>
                  <div className="relative">
                     <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={18} />
                     <input 
                        type="datetime-local" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-accent-cyan focus:bg-white/10 transition-all text-sm cursor-pointer" 
                        value={deadline} 
                        onChange={e => setDeadline(e.target.value)} 
                        onClick={(e) => { try { e.currentTarget.showPicker() } catch (err) {} }}
                        required 
                     />
                  </div>
               </div>
               <div className="group">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] block mb-3 group-focus-within:text-accent-cyan transition-colors">Supplements</label>
                  <div 
                    className="w-full bg-white/5 border border-dashed border-white/10 rounded-2xl px-6 py-3.5 text-text-muted text-xs flex items-center gap-3 cursor-pointer hover:border-accent-cyan hover:bg-white/10 transition-all group/upload"
                    onClick={() => document.getElementById('assignment-file-upload')?.click()}
                  >
                    <Upload size={16} className="group-hover/upload:text-accent-cyan transition-colors" />
                    <span className="truncate group-hover/upload:text-white transition-colors">{file ? file.name : 'Attach Reference'}</span>
                    <input id="assignment-file-upload" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" className="flex-1 btn-secondary py-4 rounded-2xl uppercase tracking-widest font-bold text-xs" onClick={onClose}>Abandon</button>
              <button type="submit" className="flex-[2] btn-primary py-4 rounded-2xl uppercase tracking-widest font-bold text-xs" disabled={loading}>
                {loading ? 'Transmitting Data...' : 'Confirm Module Creation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
