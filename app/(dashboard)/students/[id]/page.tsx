import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { FileText, MessageCircle, CheckCircle, Clock } from 'lucide-react'

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      submissions: {
        include: { assignment: true },
        orderBy: { submittedAt: 'desc' },
      },
      doubts: {
        orderBy: { createdAt: 'desc' },
      },
      quizSubmissions: {
        include: { assignment: true },
        orderBy: { submittedAt: 'desc' }
      }
    }
  })

  if (!student || student.role !== 'STUDENT') {
    redirect('/students')
  }

  const avgGrade = student.submissions.filter(s => s.grade !== null).reduce((acc, s) => acc + (s.grade || 0), 0) / (student.submissions.filter(s => s.grade !== null).length || 1)

  return (
    <div className="fade-up">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: 'bold', overflow: 'hidden' }}>
            {student.dp ? <img src={student.dp} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : student.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="page-title">{student.name}</h1>
            <p className="page-sub" style={{ fontSize: '15px' }}>{student.email} • Level {student.level} • {student.xp} XP</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}><FileText size={20} /></div>
          <div>
            <div className="stat-label">Total Submissions</div>
            <div className="stat-value">{student.submissions.length}</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-dim)', color: 'var(--success)' }}><CheckCircle size={20} /></div>
          <div>
            <div className="stat-label">Average Grade</div>
            <div className="stat-value">{student.submissions.filter(s => s.grade !== null).length > 0 ? `${Math.round(avgGrade)}%` : 'N/A'}</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-dim)', color: 'var(--warning)' }}><MessageCircle size={20} /></div>
          <div>
            <div className="stat-label">Total Doubts</div>
            <div className="stat-value">{student.doubts.length}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Recent Submissions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {student.submissions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No submissions yet.</p> : null}
            {student.submissions.slice(0, 5).map(sub => (
              <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{sub.assignment.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(sub.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div>
                  {sub.grade !== null ? (
                    <span className={`badge ${sub.grade >= 80 ? 'badge-success' : 'badge-warning'}`}>{sub.grade}%</span>
                  ) : (
                    <span className="badge badge-blue">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Recent Doubts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {student.doubts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No doubts asked.</p> : null}
            {student.doubts.slice(0, 5).map(doubt => (
              <div key={doubt.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '4px' }}>{doubt.question}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(doubt.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  <span className={`badge ${doubt.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>{doubt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 24px; font-weight: 700; color: #fff; margin-top: 4px; }
      `}</style>
    </div>
  )
}
