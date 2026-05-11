import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { calculateLevel } from '@/lib/xp'
import { Star, FileText, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'
import DpUploader from './DpUploader'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, xp: true, level: true, createdAt: true, dp: true },
  })
  if (!user) redirect('/login')

  const submissions = await prisma.submission.findMany({
    where: { studentId: session.userId },
    include: { assignment: { select: { title: true, deadline: true } } },
    orderBy: { submittedAt: 'desc' },
  })

  const gradedSubmissions = submissions.filter((s: any) => s.grade !== null)
  const avgScore = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum: number, s: any) => sum + (s.grade ?? 0), 0) / gradedSubmissions.length)
    : null

  const initials = user.name.split(' ').map((n: any) => n[0]).join('').toUpperCase().slice(0, 2)
  const xpProgress = user.xp % 100
  const xpToNext = 100 - xpProgress

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric'
  })

  // XP breakdown
  const xpBreakdown = [
    { label: 'Assignment submissions', xp: submissions.filter((s: any) => !s.isLate).length * 10 },
    { label: 'Late submissions', xp: submissions.filter((s: any) => s.isLate).length * 5 },
    { label: 'Grade bonuses (≥80%)', xp: gradedSubmissions.filter((s: any) => (s.grade ?? 0) >= 80).length * 20 },
  ]

  return (
    <div className="fade-up">
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 28 }}>Profile</h1>

      <div className="profile-grid">
        {/* Left: Avatar + Info */}
        <div>
          <div className="glass-card profile-card">
            <DpUploader currentDp={user.dp} initials={initials} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>{user.email}</p>

            <div className="role-tag">
              <span className={`badge ${user.role === 'TEACHER' ? 'badge-blue' : user.role === 'ADMIN' ? 'badge-purple' : 'badge-success'}`}>
                {user.role.toLowerCase()}
              </span>
            </div>

            <hr className="divider" />

            <div className="info-row">
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Member since</span>
              <span style={{ fontSize: 13 }}>{memberSince}</span>
            </div>

            {user.role === 'STUDENT' && (
              <>
                <div className="info-row">
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Assignments done</span>
                  <span style={{ fontSize: 13 }}>{submissions.length}</span>
                </div>
                <div className="info-row">
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Avg Score</span>
                  <span style={{ fontSize: 13 }}>{avgScore !== null ? `${avgScore}%` : '—'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: XP + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {user.role === 'STUDENT' && (
            <>
              {/* Level card */}
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 4 }}>Current Level</div>
                    <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Star size={24} style={{ color: '#f59e0b' }} />
                      Level {user.level}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{user.xp}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>total XP</div>
                  </div>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: `${xpProgress}%`, background: 'var(--gradient)', borderRadius: 999, minWidth: 4 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Level {user.level}</span>
                  <span>{xpToNext} XP to Level {user.level + 1}</span>
                  <span>Level {user.level + 1}</span>
                </div>

                {/* XP Breakdown */}
                <hr className="divider" style={{ margin: '20px 0 16px' }} />
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 12 }}>XP Breakdown</div>
                {xpBreakdown.filter((x: any) => x.xp > 0).map((x: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{x.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-blue)' }}>+{x.xp} XP</span>
                  </div>
                ))}
                {xpBreakdown.every(x => x.xp === 0) && (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Submit assignments to earn XP!</p>
                )}
              </div>

              {/* Assignment history */}
              <div className="glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <TrendingUp size={16} style={{ color: 'var(--accent-purple)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Assignment History</span>
                </div>
                {submissions.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No submissions yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {submissions.map((s: any) => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <FileText size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.assignment.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(s.submittedAt).toLocaleDateString()}
                            {s.isLate && <span style={{ marginLeft: 6, color: 'var(--warning)' }}>Late</span>}
                          </div>
                        </div>
                        {s.grade !== null && s.grade !== undefined ? (
                          <span className={`grade-chip ${s.grade >= 80 ? 'grade-high' : s.grade >= 50 ? 'grade-mid' : 'grade-low'}`}>{s.grade}%</span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: 10 }}>Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
