'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, Plus, FileText, Clock, CheckCircle, ChevronDown, ChevronUp, X, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'

type AssignmentQuestion = {
  id: string
  text: string
  options: string[]
  correctOption?: number
  timeLimit?: number
}

type Assignment = {
  id: string
  title: string
  description: string
  type: 'FILE' | 'QUIZ' | 'QA'
  deadline: string
  fileUrl?: string | null
  fileName?: string | null
  teacher?: { name: string }
  _count?: { submissions: number, quizSubmissions: number }
  assignmentQuestions?: AssignmentQuestion[]
  submission?: { grade: number | null; submittedAt: string; feedback?: string | null; answers?: string; score?: number | null } | null
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
  assignment?: { title: string, type: 'FILE' | 'QUIZ' | 'QA' }
}

type QuizSubmission = {
  id: string
  studentId: string
  assignmentId: string
  answers: string
  score: number | null
  feedback: string | null
  submittedAt: string
  isLate: boolean
  student?: { name: string; email: string }
  assignment?: { title: string, type: 'FILE' | 'QUIZ' | 'QA' }
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  // File submissions
  const [submissions, setSubmissions] = useState<Submission[]>([])
  
  const load = useCallback(async () => {
    const aRes = await fetch('/api/assignments')
    const a = await aRes.json()
    setAssignments(a)

    const res = await fetch('/api/me')
    const me = await res.json()
    setRole(me.role || '')

    if (me.role !== 'STUDENT') {
      const sRes = await fetch('/api/submissions')
      setSubmissions(await sRes.json())
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    load()
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
                    <div className="assignment-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {a.title}
                      <span className={`badge ${a.type === 'QUIZ' ? 'badge-purple' : a.type === 'QA' ? 'badge-warning' : 'badge-blue'}`} style={{ fontSize: 10 }}>
                        {a.type}
                      </span>
                    </div>
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
                    
                    {a.type === 'FILE' && a.fileUrl && (
                      <div style={{ marginBottom: 16 }}>
                        <a href={a.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                          <ExternalLink size={14} /> {a.fileName || 'View Attached Reference'}
                        </a>
                      </div>
                    )}

                    {role === 'STUDENT' && !a.submission && (
                      <>
                        {a.type === 'FILE' && <FileSubmitForm assignmentId={a.id} onSubmit={load} />}
                        {a.type === 'QUIZ' && a.assignmentQuestions && <QuizSubmitForm assignment={a} onSubmit={load} />}
                        {a.type === 'QA' && a.assignmentQuestions && <QaSubmitForm assignment={a} onSubmit={load} />}
                      </>
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
                      <>
                        {a.type === 'FILE' ? (
                          <FileSubmissionsList submissions={assignmentSubs} onGrade={load} />
                        ) : (
                          <QuizSubmissionsList assignmentId={a.id} type={a.type} onGrade={load} />
                        )}
                      </>
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

function FileSubmitForm({ assignmentId, onSubmit }: { assignmentId: string; onSubmit: () => void }) {
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

function QuizSubmitForm({ assignment, onSubmit }: { assignment: Assignment; onSubmit: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(assignment.assignmentQuestions?.length || 0).fill(-1))
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(30) // Hardcoded 30s for assignments for now

  const questions = assignment.assignmentQuestions || []
  const currentQ = questions[currentIdx]
  const questionTimeLimit = currentQ?.timeLimit || 30

  useEffect(() => {
    setTimeLeft(questionTimeLimit)
  }, [currentIdx, questionTimeLimit])

  useEffect(() => {
    if (timeLeft <= 0) {
      handleNext()
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  function handleSelect(optIdx: number) {
    const newAns = [...answers]
    newAns[currentIdx] = optIdx
    setAnswers(newAns)
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
    } else {
      submitQuiz(answers) // if last question times out, submit
    }
  }

  async function submitQuiz(finalAnswers = answers) {
    setLoading(true)
    await fetch(`/api/assignments/${assignment.id}/submit-quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: finalAnswers }),
    })
    onSubmit()
  }

  const progressPct = (timeLeft / questionTimeLimit) * 100
  const isWarning = timeLeft <= 5

  return (
    <div style={{ padding: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h4 style={{ fontSize: 16, fontWeight: 600 }}>Question {currentIdx + 1} of {questions.length}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isWarning ? 'var(--danger)' : 'var(--accent-purple)' }}>
          <Clock size={16} />
          <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>00:{timeLeft.toString().padStart(2, '0')}</span>
        </div>
      </div>
      
      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: isWarning ? 'var(--danger)' : 'var(--accent-purple)', transition: 'width 1s linear' }} />
      </div>

      <p style={{ fontSize: 18, marginBottom: 20, fontWeight: 500 }}>{currentQ?.text}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {currentQ?.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`option-btn ${answers[currentIdx] === i ? 'selected' : ''}`}
            style={{ 
              padding: '16px 20px', borderRadius: 10, border: '1px solid var(--border)', 
              background: answers[currentIdx] === i ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
              borderColor: answers[currentIdx] === i ? 'var(--accent-purple)' : 'var(--border)',
              color: '#fff', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 12
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
              {String.fromCharCode(65 + i)}
            </div>
            {opt}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {currentIdx < questions.length - 1 ? (
          <button className="btn-secondary" onClick={handleNext}>Next Question</button>
        ) : (
          <button className="btn-primary" onClick={() => submitQuiz()} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}

function QaSubmitForm({ assignment, onSubmit }: { assignment: Assignment; onSubmit: () => void }) {
  const questions = assignment.assignmentQuestions || []
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''))
  const [loading, setLoading] = useState(false)

  async function submitQa() {
    setLoading(true)
    await fetch(`/api/assignments/${assignment.id}/submit-qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    onSubmit()
  }

  return (
    <div style={{ padding: 20, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {questions.map((q, i) => (
        <div key={q.id}>
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{i + 1}. {q.text}</h4>
          <textarea 
            className="input" 
            rows={4} 
            placeholder="Type your answer here..." 
            value={answers[i]}
            onChange={e => {
              const newAns = [...answers]
              newAns[i] = e.target.value
              setAnswers(newAns)
            }}
            style={{ resize: 'vertical' }}
          />
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={submitQa} disabled={loading || answers.some(a => !a.trim())}>
          {loading ? 'Submitting...' : 'Submit Assignment'}
        </button>
      </div>
    </div>
  )
}

function FileSubmissionsList({ submissions, onGrade }: { submissions: Submission[]; onGrade: () => void }) {
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

function QuizSubmissionsList({ assignmentId, type, onGrade }: { assignmentId: string; type: 'QUIZ' | 'QA'; onGrade: () => void }) {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [grade, setGrade] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    fetch(`/api/assignments/${assignmentId}/quiz-submissions`)
      .then(res => res.json())
      .then(data => { setSubmissions(data); setLoading(false) })
  }, [assignmentId])

  async function saveGrade(id: string) {
    await fetch(`/api/quiz-submissions/${id}/grade`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grade: parseInt(grade), feedback }),
    })
    setGradingId(null)
    setGrade('')
    setFeedback('')
    onGrade()
    
    // reload submissions
    const res = await fetch(`/api/assignments/${assignmentId}/quiz-submissions`)
    setSubmissions(await res.json())
  }

  if (loading) return <Loader2 className="spinner" size={20} />
  if (submissions.length === 0) return <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No submissions yet.</p>

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
      </div>
      {submissions.map((s) => {
        let answers: any = []
        try { answers = JSON.parse(s.answers) } catch (e) {}

        return (
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
                {s.score !== null ? (
                  <span className={`badge ${s.score >= 80 ? 'badge-success' : s.score >= 50 ? 'badge-warning' : 'badge-danger'}`}>{s.score}%</span>
                ) : (
                  <button className="btn-primary" onClick={() => setGradingId(s.id)} style={{ padding: '6px 14px', fontSize: 12 }}>Grade</button>
                )}
              </div>
            </div>

            {type === 'QA' && (
               <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                 {answers.map((ans: string, i: number) => (
                   <div key={i} style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 13 }}>
                     <strong style={{ color: 'var(--text-muted)', fontSize: 11, display: 'block' }}>Q{i+1}:</strong>
                     {ans}
                   </div>
                 ))}
               </div>
            )}

            {s.feedback && s.score !== null && gradingId !== s.id && (
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
                  <button className="btn-primary" onClick={() => saveGrade(s.id)} disabled={!grade} style={{ padding: '8px 16px', fontSize: 13 }}>Save Grade</button>
                  <button className="btn-secondary" onClick={() => setGradingId(null)} style={{ padding: '8px 14px', fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )
      })}
      <style jsx>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function CreateAssignmentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [type, setType] = useState<'FILE' | 'QUIZ' | 'QA'>('FILE')
  const [file, setFile] = useState<File | null>(null)
  
  // For QUIZ / QA
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctOption: 0, timeLimit: 30 }])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addQuestion = () => setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOption: 0, timeLimit: 30 }])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      let fileUrl = null
      let fileName = null

      if (type === 'FILE' && file) {
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
        body: JSON.stringify({ 
          title, description, deadline, type, fileUrl, fileName,
          questions: type !== 'FILE' ? questions : undefined 
        }),
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
      <div className="modal glass-card" style={{ maxWidth: type === 'FILE' ? 520 : 800 }}>
        <div className="modal-header">
          <h2>Create Assignment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: 'var(--danger-dim)', color: 'var(--danger)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>{error}</div>}
          
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <button type="button" className={`type-btn ${type === 'FILE' ? 'active' : ''}`} onClick={() => setType('FILE')}>📄 File Upload</button>
            <button type="button" className={`type-btn ${type === 'QUIZ' ? 'active' : ''}`} onClick={() => setType('QUIZ')}>🎯 MCQ Quiz</button>
            <button type="button" className={`type-btn ${type === 'QA' ? 'active' : ''}`} onClick={() => setType('QA')}>❓ Q&A</button>
          </div>

          <div><label className="label">Title</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><label className="label">Description</label><textarea className="input" rows={4} value={description} onChange={e => setDescription(e.target.value)} required style={{ resize: 'vertical' }} /></div>
          
          <div>
            <label className="label">Deadline</label>
            <input 
              type="datetime-local" 
              className="input date-picker" 
              value={deadline} 
              onChange={e => setDeadline(e.target.value)} 
              onClick={(e) => { try { e.currentTarget.showPicker() } catch (err) {} }}
              required 
              style={{ cursor: 'pointer' }}
            />
          </div>

          {type === 'FILE' && (
            <div>
               <label className="label">Reference Material (Optional)</label>
               <div className="upload-area" onClick={() => document.getElementById('assignment-file-upload')?.click()}>
                 <Upload size={20} style={{ opacity: 0.5 }} />
                 <span>{file ? file.name : 'Attach a reference file or picture (max 10MB)'}</span>
                 <input id="assignment-file-upload" type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
               </div>
            </div>
          )}

          {type !== 'FILE' && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
              <label className="label" style={{ marginBottom: 16, fontSize: 16 }}>Questions Builder</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
                {questions.map((q, qIndex) => (
                  <div key={qIndex} style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Question {qIndex + 1}</span>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Remove</button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12, marginBottom: 12 }}>
                      <input className="input" placeholder="Question text" value={q.text} onChange={e => { const n = [...questions]; n[qIndex].text = e.target.value; setQuestions(n); }} required />
                      <input className="input" type="number" placeholder="Time (s)" min={5} value={q.timeLimit} onChange={e => { const n = [...questions]; n[qIndex].timeLimit = parseInt(e.target.value) || 30; setQuestions(n); }} required title="Time limit in seconds" />
                    </div>
                    
                    {type === 'QUIZ' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="radio" name={`correct-${qIndex}`} checked={q.correctOption === oIndex} onChange={() => { const n = [...questions]; n[qIndex].correctOption = oIndex; setQuestions(n); }} />
                            <input className="input" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => { const n = [...questions]; n[qIndex].options[oIndex] = e.target.value; setQuestions(n); }} required />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary" onClick={addQuestion}>+ Add Question</button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Assignment'}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; backdrop-filter: blur(4px); overflow-y: auto; overflow-x: hidden; padding: 16px; display: flex; align-items: flex-start; justify-content: center; }
        .modal { width: 100%; margin: 5vh auto; padding: 28px 24px; border-radius: var(--radius-lg); transition: all 0.3s ease; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h2 { font-size: 18px; line-height: 1.2; }
        
        .type-btn { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: var(--text-muted); cursor: pointer; transition: all 0.2s; font-weight: 500; font-size: 13px; }
        .type-btn:hover { background: rgba(255,255,255,0.05); }
        .type-btn.active { background: var(--accent-purple-dim); color: var(--accent-purple); border-color: var(--accent-purple); }

        .upload-area {
          border: 1px dashed var(--border-accent); border-radius: var(--radius-sm);
          padding: 16px; display: flex; align-items: center; gap: 10px;
          cursor: pointer; color: var(--text-muted); font-size: 13px;
          transition: border-color 0.2s, background 0.2s;
        }
        .upload-area:hover { border-color: var(--accent-purple); background: var(--accent-purple-dim); }
        
        /* Make the calendar icon hit-area full width so users don't miss it */
        .date-picker::-webkit-calendar-picker-indicator { cursor: pointer; padding: 8px; background-color: transparent; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
      `}</style>
    </div>
  )
}
