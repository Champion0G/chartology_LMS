'use client'

import { useState, useEffect, useCallback } from 'react'
import { Video, Plus, Users, Clock, Calendar, ChevronRight, Loader2, Radio, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CreateClassModal from './CreateClassModal'
import AttendancePanel from './AttendancePanel'

type LiveClass = {
  id: string; title: string; description: string | null; roomName: string
  startTime: string; endTime: string; createdAt: string
  instructor: { name: string; id: string }
  _count: { attendances: number }
}
type Props = { role: string; userId: string }
const WINDOW = 15 * 60 * 1000

function getStatus(cls: LiveClass): 'upcoming' | 'live' | 'ended' {
  const now = Date.now(), start = +new Date(cls.startTime), end = +new Date(cls.endTime)
  if (now >= start - WINDOW && now <= end + WINDOW) return 'live'
  if (now > end + WINDOW) return 'ended'
  return 'upcoming'
}

import { formatDistanceToNow } from 'date-fns'

/* ── Countdown for upcoming classes ── */
function Countdown({ target }: { target: string }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = +new Date(target) - Date.now()
      if (diff <= 0) { setLabel('Starting soon'); return }
      if (diff > 86400000) { // More than 24 hours
        setLabel(formatDistanceToNow(new Date(target)))
      } else {
        const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
        setLabel(h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`)
      }
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [target])
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{label}</span>
}

/* ── Live session elapsed timer ── */
function LiveTimer({ start }: { start: string }) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const tick = () => {
      const d = Math.max(0, Date.now() - +new Date(start))
      const h = Math.floor(d / 3600000), m = Math.floor((d % 3600000) / 60000), s = Math.floor((d % 60000) / 1000)
      setLabel(h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [start])
  return <span style={{ fontVariantNumeric: 'tabular-nums', color: '#f87171', fontWeight: 700 }}>{label}</span>
}

export default function LiveClassesClient({ role, userId }: Props) {
  const router = useRouter()
  const [classes, setClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [attendanceClassId, setAttendanceClassId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const isTeacher = role === 'TEACHER' || role === 'ADMIN'

  const load = useCallback(async () => {
    try { const res = await fetch('/api/live-classes'); if (res.ok) setClasses(await res.json()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(); const id = setInterval(load, 30_000); return () => clearInterval(id) }, [load])

  async function deleteClass(classId: string) {
    if (!confirm('Delete this class? This cannot be undone.')) return
    setDeletingId(classId)
    try {
      const res = await fetch(`/api/live-classes/${classId}`, { method: 'DELETE' })
      if (res.ok) setClasses(prev => prev.filter(c => c.id !== classId))
    } finally { setDeletingId(null) }
  }

  const live     = classes.filter(c => getStatus(c) === 'live')
  const upcoming = classes.filter(c => getStatus(c) === 'upcoming')
  const ended    = classes.filter(c => getStatus(c) === 'ended')

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:14 }}>
      <Loader2 className="lc-spin" size={34} style={{ color:'#ef4444' }} />
      <span style={{ color:'var(--text-muted)', fontSize:15 }}>Loading classes…</span>
    </div>
  )

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Classes</h1>
          <p className="page-sub">{isTeacher ? 'Manage your live sessions' : 'Join live sessions with your instructor'}</p>
        </div>
        {isTeacher && (
          <button className="btn-primary lc-hbtn" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Schedule Class
          </button>
        )}
      </div>

      {/* LIVE NOW */}
      {live.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div className="lc-label" style={{ color:'#f87171' }}>
            <Radio size={13} className="lc-pulse" /> Live Now
          </div>
          <div className="lc-grid">
            {live.map(cls => (
              <ClassCard key={cls.id} cls={cls} status="live" isTeacher={isTeacher} userId={userId} role={role}
                onJoin={() => router.push(`/live-classes/${cls.id}`)}
                onAttendance={() => setAttendanceClassId(cls.id)}
                onDelete={() => deleteClass(cls.id)}
                deleting={deletingId === cls.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING */}
      {upcoming.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div className="lc-label"><Calendar size={13} /> Upcoming</div>
          <div className="lc-grid">
            {upcoming.map(cls => (
              <ClassCard key={cls.id} cls={cls} status="upcoming" isTeacher={isTeacher} userId={userId} role={role}
                onJoin={() => router.push(`/live-classes/${cls.id}`)}
                onAttendance={() => setAttendanceClassId(cls.id)}
                onDelete={() => deleteClass(cls.id)}
                deleting={deletingId === cls.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* PAST */}
      {ended.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div className="lc-label"><Clock size={13} /> Past Sessions</div>
          <div className="lc-grid">
            {ended.map(cls => (
              <ClassCard key={cls.id} cls={cls} status="ended" isTeacher={isTeacher} userId={userId} role={role}
                onJoin={() => {}} onAttendance={() => setAttendanceClassId(cls.id)}
                onDelete={() => deleteClass(cls.id)} deleting={deletingId === cls.id}
              />
            ))}
          </div>
        </section>
      )}

      {classes.length === 0 && (
        <div className="glass-card" style={{ padding:'80px 40px', textAlign:'center' }}>
          <Video size={48} style={{ margin:'0 auto 18px', opacity:0.12, display:'block' }} />
          <h2 style={{ fontSize:22, marginBottom:8, opacity:0.65 }}>No Classes Yet</h2>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>
            {isTeacher ? 'Schedule your first live class to get started.' : 'Your instructor will schedule classes soon.'}
          </p>
          {isTeacher && (
            <button className="btn-primary" style={{ marginTop:24 }} onClick={() => setShowCreate(true)}>
              <Plus size={14} style={{ marginRight:6 }} /> Schedule First Class
            </button>
          )}
        </div>
      )}

      {showCreate && <CreateClassModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load() }} />}
      {attendanceClassId && (
        <AttendancePanel classId={attendanceClassId}
          className={classes.find(c => c.id === attendanceClassId)?.title ?? ''}
          onClose={() => setAttendanceClassId(null)}
        />
      )}

      <style>{`
        .lc-hbtn { display:flex; align-items:center; gap:8px; }
        .lc-label { display:flex; align-items:center; gap:8px; font-size:11px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--text-muted); margin-bottom:14px; }
        .lc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
        .lc-pulse { animation:lcpulse 2s ease-in-out infinite; }
        @keyframes lcpulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .lc-spin { animation:spin 1s linear infinite; }
        @keyframes spin { 100%{transform:rotate(360deg)} }
        @media(max-width:768px){ .lc-grid{grid-template-columns:1fr} }
      `}</style>
    </div>
  )
}

function ClassCard({ cls, status, isTeacher, userId, role, onJoin, onAttendance, onDelete, deleting }: {
  cls: LiveClass; status: 'live'|'upcoming'|'ended'; isTeacher: boolean; userId: string; role: string
  onJoin:()=>void; onAttendance:()=>void; onDelete:()=>void; deleting:boolean
}) {
  const start = new Date(cls.startTime), end = new Date(cls.endTime)
  const durMin = Math.round((+end - +start) / 60000)
  const isOwner = cls.instructor.id === userId

  const badge = {
    live:     { bg:'rgba(239,68,68,.15)',  color:'#f87171', text:'● LIVE',    border:'rgba(239,68,68,.3)' },
    upcoming: { bg:'rgba(34,197,94,.15)',  color:'#22c55e', text:'UPCOMING',  border:'rgba(34,197,94,.3)' },
    ended:    { bg:'rgba(239,68,68,.05)',  color:'var(--danger)', text:'ENDED',border:'rgba(239,68,68,.2)' },
  }[status]

  const cardBorder = status === 'live' ? 'rgba(239, 68, 68, 0.8)' : 'var(--border)'
  const cardGlow   = status === 'live' ? 'rgba(239, 68, 68, 0.4)' : 'transparent'

  return (
    <div className="glass-card lc-card" style={{ borderColor:cardBorder, boxShadow:`var(--shadow-card), 0 0 28px ${cardGlow}` }}>
      {/* Badge row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ background:badge.bg, color:badge.color, border:`1px solid ${badge.border}`, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:'.5px' }}>
          {badge.text}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {status === 'live' && <LiveTimer start={cls.startTime} />}
          <div style={{ display:'flex', alignItems:'center', gap:5, color:'var(--text-muted)', fontSize:12 }}>
            <Users size={12} />{cls._count.attendances}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6, lineHeight:1.35 }}>{cls.title}</h3>
      {cls.description && <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:12, lineHeight:1.5 }}>{cls.description}</p>}

      {/* Meta */}
      <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:18, fontSize:13, color:'var(--text-secondary)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <Calendar size={12} style={{ color:'#ef4444', flexShrink:0 }} />
          {start.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}
          {' · '}{start.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} – {end.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <Clock size={12} style={{ color:'#dc2626', flexShrink:0 }} />
          {durMin} min · By {cls.instructor.name}
        </div>
      </div>

      {/* Countdown for upcoming */}
      {status === 'upcoming' && (
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', marginBottom:14, display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--text-secondary)' }}>
          <Clock size={13} /> Starts in <Countdown target={cls.startTime} />
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:8 }}>
        {status === 'live' && (
          <button className="btn-primary lc-join" style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)', fontWeight: 800, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }} onClick={onJoin}>
            <Video size={14} style={{ marginRight: 4 }} /> JOIN NOW <ChevronRight size={14} />
          </button>
        )}
        {status === 'upcoming' && (
          <button className="btn-secondary" style={{ flex:1, opacity:.55, cursor:'default' }} disabled>
            <Clock size={12} style={{ marginRight:5 }} />
            Opens {start.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
          </button>
        )}
        {status === 'ended' && (
          <span style={{ fontSize:13, color:'var(--text-muted)', alignSelf:'center' }}>Session ended</span>
        )}
        {isTeacher && (
          <button className="btn-secondary lc-icon" onClick={onAttendance} title="Attendance">
            <Users size={14} />
          </button>
        )}
        {(isOwner || role === 'ADMIN') && (
          <button className="btn-secondary lc-icon" onClick={onDelete} disabled={deleting}
            title="Delete class" style={{ borderColor:'rgba(239,68,68,.25)', color:'#f87171' }}>
            {deleting ? <Loader2 size={14} className="lc-spin" /> : <Trash2 size={14} />}
          </button>
        )}
      </div>

      <style>{`
        .lc-card { padding:22px; transition:all .3s ease !important; }
        .lc-card:hover { transform:translateY(-2px) !important; box-shadow: var(--shadow-card), 0 0 40px rgba(239,68,68,0.15) !important; border-color: rgba(239,68,68,0.4) !important; }
        .lc-join { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; }
        .lc-icon { padding:9px 13px; display:flex; align-items:center; }
      `}</style>
    </div>
  )
}
