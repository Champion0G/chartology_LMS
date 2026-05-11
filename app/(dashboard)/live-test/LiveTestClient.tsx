'use client'

import { useState, useEffect } from 'react'
import { Play, Plus, X, Loader2, CheckCircle2, Clock, AlertTriangle, Trophy, Medal } from 'lucide-react'

type Question = {
  id: string
  text: string
  options: string[]
}

type Quiz = {
  id: string
  title: string
  isActive: boolean
  totalQuestions: number
  timePerQuestion: number
  questions: Question[]
}

export default function LiveTestClient({ role }: { role: string }) {
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  
  const [localQuestionIndex, setLocalQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [timeTaken, setTimeTaken] = useState<number>(0)

  // Poll for active quiz
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/live-test/active')
        if (res.ok) {
          const data = await res.json()
          if (!activeQuiz && data && !isCompleted) {
             setTimeLeft(data.timePerQuestion || 30)
          }
          setActiveQuiz(data)
        } else {
          setActiveQuiz(null)
          // If quiz is stopped, reset student state
          setLocalQuestionIndex(0)
          setIsCompleted(false)
          setHasAnswered(false)
        }
      } catch (e) {} finally {
        setLoading(false)
      }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [activeQuiz?.id, isCompleted])

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || hasAnswered || timeLeft <= 0 || isCompleted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
      setTimeTaken(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [activeQuiz, hasAnswered, timeLeft, isCompleted])

  async function handleTimeUp() {
    if (hasAnswered) return
    setHasAnswered(true)
    
    try {
      await fetch('/api/live-test/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quizId: activeQuiz?.id, 
          questionId: activeQuiz?.questions[localQuestionIndex].id, 
          answerIndex: -1,
          timeTaken: activeQuiz?.timePerQuestion || 30
        })
      })
    } catch (e) {}
  }

  if (role === 'TEACHER' || role === 'ADMIN') {
    return <TeacherQuizClient onOpenCreate={() => setShowCreate(true)} showCreate={showCreate} setShowCreate={setShowCreate} />
  }

  if (loading && !activeQuiz) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <Loader2 className="spinner" size={40} style={{ color: 'var(--accent-purple)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Waiting for live quiz...</p>
      </div>
    )
  }

  if (!activeQuiz) {
    return (
      <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
        <Clock size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>No Live Quiz Active</h2>
        <p style={{ color: 'var(--text-muted)' }}>Your teacher will start a quiz soon. Stand by!</p>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="glass-card fade-up" style={{ padding: 60, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <Trophy size={64} style={{ margin: '0 auto 24px', color: '#fbbf24' }} />
        <h2 style={{ fontSize: 28, marginBottom: 12, fontWeight: 800 }}>Quiz Completed!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.5 }}>
          Awesome job! You've finished all the questions.<br/>
          Check the screen or wait for the teacher to reveal the final leaderboard.
        </p>
      </div>
    )
  }

  const currentQuestion = activeQuiz.questions[localQuestionIndex]

  async function handleAnswer(index: number) {
    if (hasAnswered || timeLeft <= 0) return
    setSelectedOption(index)
    setHasAnswered(true)
    
    try {
      await fetch('/api/live-test/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quizId: activeQuiz?.id, 
          questionId: currentQuestion.id, 
          answerIndex: index,
          timeTaken
        })
      })
    } catch (e) {}
  }

  function nextQuestion() {
    if (localQuestionIndex < activeQuiz!.totalQuestions - 1) {
      setLocalQuestionIndex(prev => prev + 1)
      setHasAnswered(false)
      setSelectedOption(null)
      setTimeLeft(activeQuiz!.timePerQuestion || 30)
      setTimeTaken(0)
    } else {
      setIsCompleted(true)
    }
  }

  const progressPct = (timeLeft / (activeQuiz.timePerQuestion || 30)) * 100
  const isWarning = timeLeft <= 5

  return (
    <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{activeQuiz.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Live Session · Question {localQuestionIndex + 1} of {activeQuiz.totalQuestions}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="timer-container" style={{ display: 'flex', alignItems: 'center', gap: 8, background: isWarning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '8px 16px', borderRadius: 20, border: `1px solid ${isWarning ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
            <Clock size={18} color={isWarning ? '#f87171' : 'var(--accent-purple)'} />
            <span style={{ fontSize: 18, fontWeight: 700, color: isWarning ? '#f87171' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="badge-pulse">LIVE</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 40, position: 'relative', overflow: 'hidden' }}>
        {/* Timer progress bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, height: 4, width: '100%', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: isWarning ? 'var(--danger)' : 'var(--accent-purple)', transition: 'width 1s linear, background-color 0.3s' }} />
        </div>

        <div style={{ marginBottom: 32, marginTop: 8 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.4 }}>{currentQuestion.text}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentQuestion.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={hasAnswered || timeLeft <= 0}
              className={`option-btn ${selectedOption === i ? 'selected' : ''} ${hasAnswered || timeLeft <= 0 ? 'disabled' : ''}`}
            >
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                {String.fromCharCode(65 + i)}
              </div>
              <span>{opt}</span>
              {selectedOption === i && <CheckCircle2 size={18} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>

        {hasAnswered && (
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle2 size={20} style={{ color: 'var(--accent-purple)' }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Answer submitted! You can move to the next question.</p>
            </div>
            <button className="btn-primary" onClick={nextQuestion}>
              {localQuestionIndex < activeQuiz.totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        )}

        {!hasAnswered && timeLeft <= 0 && (
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Time's up! Moving on...</p>
            </div>
            <button className="btn-primary" onClick={nextQuestion}>
              {localQuestionIndex < activeQuiz.totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .badge-pulse { background: rgba(239, 68, 68, 0.2); color: #f87171; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid rgba(239, 68, 68, 0.3); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .option-btn { display: flex; alignItems: center; gap: 16px; padding: 18px 24px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: #fff; cursor: pointer; transition: all 0.2s; text-align: left; width: 100%; }
        .option-btn:not(.disabled):hover { border-color: var(--accent-purple); background: rgba(239, 68, 68, 0.05); transform: translateX(4px); }
        .option-btn.selected { border-color: var(--accent-purple); background: rgba(239, 68, 68, 0.15); color: var(--accent-purple); box-shadow: 0 0 20px rgba(239, 68, 68, 0.1); }
        .option-btn.disabled { cursor: default; opacity: 0.8; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function TeacherQuizClient({ onOpenCreate, showCreate, setShowCreate }: any) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await fetch('/api/quizzes')
    if (res.ok) setQuizzes(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleQuiz(id: string, active: boolean) {
    const res = await fetch(`/api/live-test/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active })
    })
    if (res.ok) load()
  }

  const activeQuiz = quizzes.find(q => q.isActive)

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 className="page-title" style={{ margin: 0 }}>Live Quiz Management</h1>
        <button className="btn-primary" onClick={onOpenCreate}>
          <Plus size={16} /> New Live Quiz
        </button>
      </div>

      {!activeQuiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {quizzes.map(q => (
            <div key={q.id} className="glass-card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{q.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {q.totalQuestions} Questions · {q.timePerQuestion}s/Question
                </p>
              </div>
              <button className="btn-primary" onClick={() => toggleQuiz(q.id, true)}>Start Live Session</button>
            </div>
          ))}
        </div>
      )}

      {activeQuiz && (
        <div>
          <div className="glass-card" style={{ padding: 24, marginBottom: 24, borderLeft: '4px solid #f87171', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', animation: 'pulse 2s infinite' }} />
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{activeQuiz.title} - LIVE</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Students are currently taking this quiz. Monitor their progress below.
              </p>
            </div>
            <button className="btn-danger-dim" style={{ color: '#f87171', padding: '10px 20px' }} onClick={() => toggleQuiz(activeQuiz.id, false)}>
              End Session
            </button>
          </div>

          <LeaderboardPanel quizId={activeQuiz.id} />
        </div>
      )}

      {showCreate && <CreateQuizModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  )
}

function LeaderboardPanel({ quizId }: { quizId: string }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const res = await fetch(`/api/live-test/${quizId}/leaderboard`)
      if (res.ok) {
        setLeaderboard(await res.json())
      }
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 3000)
    return () => clearInterval(interval)
  }, [quizId])

  return (
    <div className="glass-card" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Trophy size={24} style={{ color: '#fbbf24' }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Live Leaderboard</h2>
      </div>

      {leaderboard.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Waiting for student answers...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {leaderboard.map((student, idx) => (
            <div key={student.studentName} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: 16, borderRadius: 12, 
              background: idx === 0 ? 'rgba(251, 191, 36, 0.1)' : idx === 1 ? 'rgba(156, 163, 175, 0.1)' : idx === 2 ? 'rgba(180, 83, 9, 0.1)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${idx === 0 ? 'rgba(251, 191, 36, 0.3)' : idx === 1 ? 'rgba(156, 163, 175, 0.3)' : idx === 2 ? 'rgba(180, 83, 9, 0.3)' : 'var(--border)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: idx < 3 ? '#fff' : 'var(--text-muted)' }}>
                  {idx + 1}
                </div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600 }}>{student.studentName}</h4>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 2 }}>Score</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-purple)' }}>{student.score}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 2 }}>Total Time</span>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{student.totalTime}s</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateQuizModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [timePerQuestion, setTimePerQuestion] = useState(30)
  const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctIndex: 0 }])
  const [loading, setLoading] = useState(false)

  const addQuestion = () => setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, timePerQuestion, questions })
    })
    if (res.ok) {
      onCreated()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="modal-breakout-overlay">
      <div className="modal-fullscreen-content">
        <div className="modal-fullscreen-wrapper">
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 48, alignItems: 'center' }}>
            <div>
              <h2 className="gradient-text" style={{ fontSize: 36, fontWeight: 800 }}>Create Live Quiz</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 4 }}>Create a new quiz for your students</p>
            </div>
            <button className="close-btn-breakout" type="button" onClick={onClose}><X size={28} /></button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="form-group-fullscreen">
                <label className="label">Quiz Title</label>
                <input className="input" placeholder="e.g. Chapter 4 Test" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group-fullscreen">
                <label className="label">Time per question (seconds)</label>
                <input type="number" className="input" min="5" max="300" value={timePerQuestion} onChange={e => setTimePerQuestion(parseInt(e.target.value))} required />
              </div>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} className="glass-card" style={{ padding: 24, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600 }}>Question {qIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button type="button" className="btn-danger-dim" onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))}>Remove</button>
                  )}
                </div>
                <input 
                  className="input" 
                  style={{ marginBottom: 20 }}
                  placeholder="Question text" 
                  value={q.text} 
                  onChange={e => {
                    const newQ = [...questions]; newQ[qIndex].text = e.target.value; setQuestions(newQ);
                  }} 
                  required 
                />
                <div className="options-grid">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input 
                        type="radio" 
                        name={`correct-${qIndex}`} 
                        checked={q.correctIndex === oIndex} 
                        onChange={() => {
                          const newQ = [...questions]; newQ[qIndex].correctIndex = oIndex; setQuestions(newQ);
                        }}
                      />
                      <input 
                        className="input" 
                        placeholder={`Option ${oIndex + 1}`} 
                        value={opt} 
                        onChange={e => {
                          const newQ = [...questions]; newQ[qIndex].options[oIndex] = e.target.value; setQuestions(newQ);
                        }} 
                        required 
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button type="button" className="btn-secondary" onClick={addQuestion}>+ Add Another Question</button>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn-secondary" style={{ padding: '12px 24px' }} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '12px 32px' }} disabled={loading}>
                {loading ? <Loader2 size={20} className="spinner" /> : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .modal-breakout-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--bg-primary); z-index: 999999; overflow-y: auto; overflow-x: hidden; display: flex; align-items: flex-start; justify-content: center; padding: 40px; }
        .modal-fullscreen-content { width: 100%; max-width: 900px; position: relative; }
        .close-btn-breakout { position: fixed; top: 40px; right: 40px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-muted); padding: 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; z-index: 1000000; }
        .close-btn-breakout:hover { background: rgba(239, 68, 68, 0.1); color: var(--danger); border-color: var(--danger-dim); }
        .form-group-fullscreen { display: flex; flex-direction: column; gap: 8px; }
        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
          .modal-breakout-overlay { padding: 20px; align-items: flex-start; }
          .close-btn-breakout { top: 20px; right: 20px; padding: 10px; }
          .options-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}

