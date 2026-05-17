import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { calculateLevel } from '@/lib/xp'
import { FileText, MessageCircle, CheckCircle, Clock, TrendingUp, Star, Users, Shield } from 'lucide-react'
import NotificationsWidget from '@/components/NotificationsWidget'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  if (session.role === 'STUDENT') {
    return <StudentDashboard userId={session.userId} />
  }
  return <TeacherDashboard />
}

async function StudentDashboard({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, xp: true, level: true },
  })
  if (!user) redirect('/login')

  const submissions = await prisma.submission.findMany({
    where: { studentId: userId },
    include: { assignment: { select: { title: true } } },
    orderBy: { submittedAt: 'desc' },
    take: 5,
  })

  const totalAssignments = await prisma.assignment.count()
  const submittedCount = await prisma.submission.count({ where: { studentId: userId } })
  const pendingCount = totalAssignments - submittedCount

  const gradedSubmissions = submissions.filter((s: any) => s.grade !== null && s.grade !== undefined)
  const avgScore =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce((sum: number, s: any) => sum + (s.grade ?? 0), 0) / gradedSubmissions.length
        )
      : null

  const xpToNextLevel = 100 - (user.xp % 100)
  const xpProgress = user.xp % 100

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Welcome back, {user.name.split(' ')[0]} 👋</p>
        </div>
        <div className="level-badge-large">
          <Star size={16} />
          <span>Level {user.level}</span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="glass-card xp-card">
        <div className="xp-header">
          <div>
            <div className="xp-label">XP Progress</div>
            <div className="xp-value">{user.xp} XP total</div>
          </div>
          <div className="xp-next">
            <span>{xpToNextLevel} XP to Level {user.level + 1}</span>
          </div>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
        </div>
        <div className="xp-ticks">
          <span>Level {user.level}</span>
          <span>{xpProgress}/100 XP</span>
          <span>Level {user.level + 1}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard icon={<FileText size={20} />} label="Total Assignments" value={totalAssignments} color="blue" href="/assignments" />
        <StatCard icon={<CheckCircle size={20} />} label="Submitted" value={submittedCount} color="success" href="/assignments" />
        <StatCard icon={<Clock size={20} />} label="Pending" value={pendingCount} color="warning" href="/assignments" />
        <StatCard icon={<TrendingUp size={20} />} label="Avg Score" value={avgScore !== null ? `${avgScore}%` : '—'} color="purple" href="/assignments" />
      </div>

      {/* Recent activity & Notifications Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Activity Column */}
        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--text-secondary)' }}>Recent Activity</h2>
          {submissions.length === 0 ? (
            <EmptyState icon={<FileText size={32} />} message="No submissions yet. Start by submitting an assignment!" />
          ) : (
            <div className="activity-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {submissions.map((s: any) => (
              <div key={s.id} className="activity-item glass-card">
                <div className="activity-icon">
                  <FileText size={16} />
                </div>
                <div className="activity-info">
                  <div className="activity-title">{s.assignment.title}</div>
                  <div className="activity-meta">
                    Submitted {new Date(s.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {s.isLate && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Late</span>}
                  </div>
                </div>
                {s.grade !== null && s.grade !== undefined ? (
                  <div className={`grade-chip ${s.grade >= 80 ? 'grade-high' : s.grade >= 50 ? 'grade-mid' : 'grade-low'}`}>
                    {s.grade}%
                  </div>
                ) : (
                  <span className="badge badge-warning">Pending</span>
                )}
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Notifications Column */}
        <NotificationsWidget />
        
      </div>

    </div>
  )
}

async function TeacherDashboard() {
  const [
    totalStudents,
    totalTeachers,
    totalAssignments,
    openAssignments,
    closedAssignments,
    pendingReviews,
    openDoubts,
    recentSubmissions
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.assignment.count(),
    prisma.assignment.count({ where: { deadline: { gt: new Date() } } }),
    prisma.assignment.count({ where: { deadline: { lt: new Date() } } }),
    prisma.submission.count({ where: { grade: null } }),
    prisma.doubt.count({ where: { status: 'OPEN' } }),
    prisma.submission.findMany({
      where: { grade: null },
      include: {
        student: { select: { name: true } },
        assignment: { select: { title: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 8,
    }),
  ])

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teacher Dashboard</h1>
          <p className="page-sub">Overview of your students&apos; progress</p>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <StatCard icon={<Users size={20} />} label="Total Students" value={totalStudents} color="blue" href="/students" />
        <StatCard icon={<Shield size={20} />} label="Total Teachers" value={totalTeachers} color="purple" href="/teacher-tracker" />
        <StatCard icon={<FileText size={20} />} label="Total Assignments" value={totalAssignments} color="blue" href="/assignments" />
        <StatCard icon={<Clock size={20} />} label="Open Assignments" value={openAssignments} color="warning" href="/assignments" />
        <StatCard icon={<CheckCircle size={20} />} label="Closed Assignments" value={closedAssignments} color="success" href="/assignments" />
        <StatCard icon={<Clock size={20} />} label="Pending Reviews" value={pendingReviews} color="warning" href="/assignments" />
        <StatCard icon={<MessageCircle size={20} />} label="Open Doubts" value={openDoubts} color="purple" href="/doubts" />
      </div>

      {/* Unreviewed Submissions & Notifications Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
        
        {/* Unreviewed Column */}
        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
            Unreviewed Submissions
          </h2>
          {recentSubmissions.length === 0 ? (
            <EmptyState icon={<CheckCircle size={32} />} message="All caught up! No pending reviews." />
          ) : (
            <div className="activity-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {recentSubmissions.map((s: any) => (
              <Link href="/assignments" key={s.id} style={{ textDecoration: 'none' }}>
                <div className="activity-item glass-card" style={{ cursor: 'pointer' }}>
                  <div className="activity-icon" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
                    <FileText size={16} />
                  </div>
                  <div className="activity-info">
                    <div className="activity-title">{s.student.name}</div>
                    <div className="activity-meta">{s.assignment.title}</div>
                  </div>
                  <span className="badge badge-warning">Needs Review</span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
        
        {/* Notifications Column */}
        <NotificationsWidget />
        
      </div>

    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: 'blue' | 'purple' | 'success' | 'warning'
  href?: string
}) {
  const colorMap = {
    blue: { bg: 'var(--accent-red-dim)', fg: 'var(--accent-red)' },
    purple: { bg: 'rgba(220, 38, 38, 0.15)', fg: '#dc2626' },
    success: { bg: 'var(--success-dim)', fg: 'var(--success)' },
    warning: { bg: 'var(--warning-dim)', fg: 'var(--warning)' },
  }
  const c = colorMap[color]
  
  const content = (
    <div className="stat-card glass-card" style={href ? { cursor: 'pointer', transition: 'transform 0.2s', backgroundImage: 'var(--bg-card)' } : {}}>
      <div className="stat-card-main">
        <div className="stat-card-left">
          <div className="stat-icon" style={{ background: c.bg, color: c.fg }}>
            {icon}
          </div>
          <div className="stat-label">{label}</div>
        </div>
        <div className="stat-card-right">
          {value}
        </div>
      </div>
    </div>
  )
  
  if (href) return <Link href={href} style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}>{content}</Link>
  return content
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="empty-state glass-card">
      <div className="empty-icon">{icon}</div>
      <p>{message}</p>
    </div>
  )
}

