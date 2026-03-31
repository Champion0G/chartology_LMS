'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, Plus, FileText, Clock, CheckCircle, ChevronDown, ChevronUp, X, ExternalLink } from 'lucide-react'

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
    // Detect role from sidebar
    fetch('/api/me').then(r => r.json()).then(d => setRole(d.role || '')).catch(() => {})
  }, [load])

  function deadlineStatus(deadline: string) {
    const d = new Date(deadline)
    const now = new Date()
    const diff = d.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (diff < 0) return { label: 'Overdue', color: 'danger' }
    if (days <= 2) return { label: `${days}d left`, color: 'warning' }
    return { label: `${days}d left`, color: 'success' }
  }

  if (loading) {
    return (
      <div className="fade-up">
        <h1 className="page-title" style={{ marginBottom: 28 }}>Assignments</h1>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 100, marginBottom: 12, borderRadius: 12 }} />
        ))}
      </div>
    )
  }

  return (
    <>
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-sub">{assignments.length} assignment{assignments.length !== 1 ? 's' : ''} total</p>
        </div>
        {(role === 'TEACHER' || role === 'ADMIN') && (
          <button className="btn-primary" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={16} /> Create Assignment
          </button>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state glass-card">
          <FileText size={32} style={{ opacity: 0.3 }} />
          <p>No assignments yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignments.map((a) => {
            const dl = deadlineStatus(a.deadline)
            const isExpanded = expandedId === a.id
            const assignmentSubs = submissions.filter((s) => 'assignmentId' in s ? (s as { assignmentId?: string }).assignmentId === a.id : s.assignment?.title === a.title)

            return (
              <div key={a.id} className="glass-card assignment-card">
                <div className="assignment-header" onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                  <div className="assignment-icon">
                    <FileText size={18} />
                  </div>
                  <div className="assignment-info">
                    <div className="assignment-title">{a.title}</div>
                    <div className="assignment-meta">
                      {a.teacher && <span>by {a.teacher.name} · </span>}
                      <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span className={`badge badge-${dl.color}`}>{dl.label}</span>
                    {a.submission && (
                      a.submission.grade !== null && a.submission.grade !== undefined ? (
                        <span className={`badge ${a.submission.grade >= 80 ? 'badge-success' : a.submission.grade >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                          {a.submission.grade}%
                        </span>
                      ) : (
                        <span className="badge badge-blue">Submitted</span>
                      )
                    )}
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="assignment-body">
                    <p className="assignment-desc">{a.description}</p>
                    
                    {a.fileUrl && (
                      <div style={{ marginBottom: 16 }}>
                        <a href={a.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                          <ExternalLink size={14} /> {a.fileName || 'View Attached Reference'}
                        </a>
                      </div>
                    )}

                    {role === 'STUDENT' && !a.submission && (
                      <SubmitForm assignmentId={a.id} onSubmit={load} />
                    )}
                    {role === 'STUDENT' && a.submission && (
                      <div className="submission-done" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle size={16} />
                          <span>Submitted on {new Date(a.submission.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {a.submission.feedback && (
                          <div style={{ marginTop: 4, width: '100%', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 8, borderLeft: '3px solid var(--accent-purple)', fontSize: 13, color: 'var(--text-secondary)' }}>
                            <strong style={{ display: 'block', marginBottom: 4, color: '#fff' }}>Teacher Feedback:</strong>
                            {a.submission.feedback}
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
            )
          })}
        </div>
      )}
    </div>

    {showCreate && <CreateAssignmentModal onClose={() => setShowCreate(false)} onCreated={load} />}

    <style jsx>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        .page-title { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
        .page-sub { color: var(--text-muted); font-size: 14px; }
        .assignment-card { overflow: hidden; }
        .assignment-header { display: flex; align-items: center; gap: 14px; padding: 18px 20px; cursor: pointer; }
        .assignment-icon {
          width: 40px; height: 40px; border-radius: 10px; background: var(--accent-purple-dim);
          color: var(--accent-purple); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .assignment-info { flex: 1; min-width: 0; }
        .assignment-title { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .assignment-meta { font-size: 12px; color: var(--text-muted); margin-top: 3px; display: flex; align-items: center; gap: 2px; }
        .assignment-body { border-top: 1px solid var(--border); padding: 20px; }
        .assignment-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px; }
        .submission-done { display: flex; align-items: center; gap: 8px; color: var(--success); font-size: 14px; }
        .empty-state { padding: 48px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; color: var(--text-muted); font-size: 14px; }
      `}</style>
    </>
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
    <form onSubmit={handleSubmit}>
      {error && <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', borderRadius: 8, padding: '8px 12px', fontSize:13, marginBottom: 12 }}>{error}</div>}
      <div className="upload-area" onClick={() => document.getElementById(`file-${assignmentId}`)?.click()}>
        <Upload size={20} style={{ opacity: 0.5 }} />
        <span>{file ? file.name : 'Click to upload your submission (max 10MB)'}</span>
        <input id={`file-${assignmentId}`} type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>
      <button type="submit" className="btn-primary" disabled={!file || loading} style={{ marginTop: 12 }}>
        {loading ? 'Submitting...' : 'Submit Assignment'}
      </button>
      <style jsx>{`
        .upload-area {
          border: 1px dashed var(--border-accent); border-radius: var(--radius-sm);
          padding: 20px; display: flex; align-items: center; gap: 10px;
          cursor: pointer; color: var(--text-muted); font-size: 13px;
          transition: border-color 0.2s, background 0.2s;
        }
        .upload-area:hover { border-color: var(--accent-purple); background: var(--accent-purple-dim); }
      `}</style>
    </form>
  )
}

function SubmissionsList({ submissions, onGrade }: { submissions: Submission[]; onGrade: () => void }) {
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  if (submissions.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No submissions yet.</p>
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
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
      </div>
      {submissions.map((s) => (
        <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 8, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.student?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {new Date(s.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                {s.isLate && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Late</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <a href={s.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ExternalLink size={13} /> View File
              </a>
              {s.grade !== null && s.grade !== undefined ? (
                <span className={`badge ${s.grade >= 80 ? 'badge-success' : s.grade >= 50 ? 'badge-warning' : 'badge-danger'}`}>{s.grade}%</span>
              ) : (
                <button className="btn-primary" onClick={() => setGradingId(s.id)} style={{ padding: '6px 14px', fontSize: 12 }}>Grade</button>
              )}
            </div>
          </div>

          {s.feedback && s.grade !== null && gradingId !== s.id && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 4 }}>Your Feedback:</span>
              {s.feedback}
            </div>
          )}

          {gradingId === s.id && (
            <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <input type="number" min={0} max={100} placeholder="Grade (0-100)" className="input" value={grade} onChange={e => setGrade(e.target.value)} style={{ flex: '0 0 160px' }} />
                <input type="text" placeholder="Feedback (optional)" className="input" value={feedback} onChange={e => setFeedback(e.target.value)} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={() => saveGrade(s.id)} disabled={!grade || saving} style={{ padding: '8px 16px', fontSize: 13 }}>
                  {saving ? 'Saving...' : 'Save Grade'}
                </button>
                <button className="btn-secondary" onClick={() => setGradingId(null)} style={{ padding: '8px 14px', fontSize: 13 }}>Cancel</button>
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
    <div className="modal-overlay">
      <div className="modal glass-card">
        <div className="modal-header">
          <h2>Create Assignment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>{error}</div>}
          <div><label className="label">Title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><label className="label">Description</label><textarea className="input" rows={4} value={description} onChange={e => setDescription(e.target.value)} required style={{ resize: 'vertical' }} /></div>
          
          <div>
            <label className="label">Deadline (Click to open Calendar)</label>
            <input 
              type="datetime-local" 
              className="input date-picker" 
              value={deadline} 
              onChange={e => setDeadline(e.target.value)} 
              onClick={(e) => {
                try { e.currentTarget.showPicker() } catch (err) {}
              }}
              required 
              style={{ cursor: 'pointer' }}
            />
          </div>

          <div>
             <label className="label">Reference Material (Optional)</label>
             <div className="upload-area" onClick={() => document.getElementById('assignment-file-upload')?.click()}>
               <Upload size={20} style={{ opacity: 0.5 }} />
               <span>{file ? file.name : 'Attach a reference file or picture (max 10MB)'}</span>
               <input id="assignment-file-upload" type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
             </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; backdrop-filter: blur(4px); overflow-y: auto; overflow-x: hidden; padding: 16px; }
        .modal { width: 100%; max-width: 520px; margin: 5vh auto; padding: 28px 24px; border-radius: var(--radius-lg); transition: all 0.3s ease; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h2 { font-size: 18px; line-height: 1.2; }
        
        .upload-area {
          border: 1px dashed var(--border-accent); border-radius: var(--radius-sm);
          padding: 16px; display: flex; align-items: center; gap: 10px;
          cursor: pointer; color: var(--text-muted); font-size: 13px;
          transition: border-color 0.2s, background 0.2s;
        }
        .upload-area:hover { border-color: var(--accent-purple); background: var(--accent-purple-dim); }
        
        /* Make the calendar icon hit-area full width so users don't miss it */
        .date-picker::-webkit-calendar-picker-indicator {
           cursor: pointer;
           padding: 8px;
           background-color: transparent;
        }
      `}</style>
    </div>
  )
}
