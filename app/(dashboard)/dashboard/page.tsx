import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { FileText, MessageCircle, Clock, Search, Bell, HelpCircle, Plus, ChevronRight, TrendingUp, CheckCircle, MoreVertical, LayoutGrid } from 'lucide-react'
import NotificationsWidget from '@/components/NotificationsWidget'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard | Chartology LMS' }

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
    take: 3,
  })

  const totalAssignments = await prisma.assignment.count()
  const submittedCount = await prisma.submission.count({ where: { studentId: userId } })
  const completionRate = totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0

  const assignments = await prisma.assignment.findMany({
    where: {
      submissions: { none: { studentId: userId } }
    },
    orderBy: { deadline: 'asc' },
    take: 2,
  })

  // Rank name based on level
  const rankNames = ['Scholar', 'Adept', 'Sage', 'Master', 'Legend']
  const rank = rankNames[Math.min(user.level - 1, rankNames.length - 1)]
  const xpProgress = user.xp % 100

  return (
    <div className="fade-up">
      {/* Greeting & Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
        <div className="lg:col-span-8">
          <h2 className="font-headline text-4xl font-extrabold text-white tracking-tight mb-2">
            Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}!</span>
          </h2>
          <p className="text-text-secondary text-lg">You've completed {submittedCount} modules so far. Keep the momentum going.</p>
        </div>
        <div className="lg:col-span-4 flex justify-end">
          <div className="glass-card p-6 flex items-center gap-6 w-full lg:w-auto shadow-glow">
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle className="text-white/5" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="text-accent-cyan" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * xpProgress) / 100} strokeWidth="4" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }}></circle>
              </svg>
              <span className="font-headline font-bold text-xl text-white">{user.level}</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Current Rank</p>
              <h3 className="font-headline font-bold text-xl text-white">{rank}</h3>
              <p className="text-accent-cyan text-xs font-semibold">{100 - xpProgress} XP to Level {user.level + 1}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <QuickNavLink icon="task" label="Assignments" href="/assignments" color="cyan" />
        <QuickNavLink icon="quiz" label="Doubts" href="/doubts" color="purple" />
        <QuickNavLink icon="folder_open" label="Resources" href="/resources" color="cyan" />
        <QuickNavLink icon="person" label="Profile" href="/profile" color="purple" />
      </div>

      {/* Course Progress Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline text-2xl font-bold text-white">Overall Progress</h3>
          <span className="text-text-secondary font-medium text-sm">Target: Completion Mastery</span>
        </div>
        <div className="glass-card p-8 shadow-glow">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-4xl font-headline font-extrabold text-accent-cyan">{completionRate}%</span>
              <span className="text-text-secondary ml-2 font-medium">Course Path Completion</span>
            </div>
            <div className="text-right">
              <span className="block text-xs font-bold text-success uppercase tracking-widest mb-1">active status</span>
              <span className="text-sm text-text-secondary italic">Next: {assignments[0]?.title || 'Finalize Track'}</span>
            </div>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient rounded-full" style={{ width: `${completionRate}%`, transition: 'width 1s ease' }}></div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Pending Assignments */}
        <div className="xl:col-span-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-2xl font-bold text-white">Pending Assignments</h3>
            <Link href="/assignments" className="text-accent-cyan font-bold text-sm hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.length > 0 ? assignments.map((a) => (
              <div key={a.id} className="glass-card overflow-hidden group">
                <div className="h-32 bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={40} className="text-accent-cyan opacity-20 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="badge badge-blue">Unit Content</span>
                    <span className="text-danger font-bold text-xs flex items-center gap-1">
                      <Clock size={14} /> {new Date(a.deadline) < new Date() ? 'Overdue' : 'Due Soon'}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-lg mb-2 text-white group-hover:text-accent-cyan transition-colors line-clamp-1">{a.title}</h4>
                  <p className="text-text-secondary text-sm mb-6 line-clamp-2">{a.description}</p>
                  <Link href="/assignments" className="btn-secondary w-full block text-center py-3 text-sm font-bold">Resume Task</Link>
                </div>
              </div>
            )) : (
              <div className="col-span-2 glass-card p-12 text-center">
                <CheckCircle size={40} className="mx-auto text-success mb-4 opacity-20" />
                <p className="text-text-secondary">All caught up! No pending assignments.</p>
              </div>
            )}

            {/* Asymmetry/Focus Item */}
            <div className="bg-accent-cyan-dim border border-accent-cyan/20 rounded-[2rem] p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
              <div>
                <h4 className="font-headline font-bold text-2xl mb-4 leading-tight text-white">Daily Recap</h4>
                <p className="text-text-secondary text-sm mb-8">Reflect on today's learning and secure your XP streak bonus.</p>
              </div>
              <button className="btn-primary self-start px-6">Launch Focus</button>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="xl:col-span-4 flex flex-col gap-8">
           <NotificationsWidget />
           <div className="glass-card p-6 border-accent-purple/10">
              <h4 className="font-headline font-bold text-white mb-4">Mastery Stats</h4>
              <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Total Score</span>
                    <span className="text-white font-bold">{submittedCount > 0 ? '88%' : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">XP Streak</span>
                    <span className="text-accent-cyan font-bold tracking-widest">🔥 5 DAYS</span>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

async function TeacherDashboard() {
  const [totalStudents, pendingReviews, openDoubts, recentSubmissions] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.submission.count({ where: { grade: null } }),
    prisma.doubt.count({ where: { status: 'OPEN' } }),
    prisma.submission.findMany({
      where: { grade: null },
      include: {
        student: { select: { name: true, email: true } },
        assignment: { select: { title: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 4,
    }),
  ])

  return (
    <div className="fade-up">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-12 pr-4">
        <div className="max-w-2xl">
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white mb-2">Class Overview</h2>
          <p className="text-text-secondary font-body leading-relaxed">Monitoring the progress of {totalStudents} enrolled curators across your modules.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/doubts" className="btn-secondary px-6 py-3 font-semibold flex items-center gap-2">
            <MessageCircle size={18} /> Manage Doubts
          </Link>
          <Link href="/assignments" className="btn-primary px-6 py-3 font-semibold flex items-center gap-2">
            <Plus size={18} /> New Assignment
          </Link>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-12 lg:col-span-8 glass-card p-8 shadow-glow">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-headline text-xl font-bold text-white">Performance Velocity</h3>
              <p className="text-xs text-text-muted font-bold tracking-widest mt-1 uppercase">Aggregate completion rate vs goal</p>
            </div>
            <div className="flex items-center gap-2 text-success font-bold bg-success-dim px-3 py-1 rounded-full text-xs">
              <TrendingUp size={14} /> +12% vs Last Week
            </div>
          </div>
          {/* Chart Mockup */}
          <div className="h-48 flex items-end justify-between gap-3 px-4">
            <Bar height="45%" active={false} />
            <Bar height="62%" active={false} />
            <Bar height="55%" active={false} />
            <Bar height="85%" active={false} />
            <Bar height="72%" active={true} label="Today" />
            <Bar height="40%" active={false} />
            <Bar height="50%" active={false} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-accent-purple-dim border border-accent-purple/20 rounded-[2rem] p-8 flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10 text-accent-purple group-hover:scale-105 transition-transform origin-left">
              <MessageCircle size={40} className="mb-4" />
              <h3 className="font-headline text-4xl font-bold text-white">{openDoubts}</h3>
              <p className="font-medium text-text-secondary">Pending Doubts</p>
            </div>
            <Link href="/doubts" className="relative z-10 w-full bg-white/10 hover:bg-white/20 backdrop-blur-md py-3 rounded-xl text-white text-center font-bold transition-all mt-4">Review Queue</Link>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent-purple/20 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
          </div>
          <div className="flex-1 bg-accent-cyan-dim border border-accent-cyan/20 rounded-[2rem] p-8 flex flex-col justify-between group">
            <div className="text-accent-cyan group-hover:scale-105 transition-transform origin-left">
              <CheckCircle size={40} className="mb-4" />
              <h3 className="font-headline text-4xl font-bold text-white">92%</h3>
              <p className="font-medium text-text-secondary">Overall Completion</p>
            </div>
            <p className="text-xs text-text-muted font-bold tracking-widest mt-4 uppercase">Institutional Avg: 78%</p>
          </div>
        </div>
      </div>

      {/* Pending Submissions Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold text-white">Pending Submissions</h3>
          <Link href="/assignments" className="text-accent-cyan font-bold text-sm hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-text-muted text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Student</th>
                <th className="px-8 py-4">Assignment</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentSubmissions.length > 0 ? recentSubmissions.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-8 py-5">
                    <div>
                      <p className="font-bold text-white group-hover:text-accent-cyan transition-colors">{s.student.name}</p>
                      <p className="text-xs text-text-muted">{s.student.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-medium text-text-secondary">{s.assignment.title}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Link href="/assignments" className="text-accent-cyan hover:bg-accent-cyan/10 p-2 rounded-lg transition-all inline-flex items-center gap-1 font-bold text-xs">
                      Grade <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-text-muted">
                    No pending reviews. You're all caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Bar({ height, active, label }: { height: string, active: boolean, label?: string }) {
  return (
    <div className={`w-full ${active ? 'bg-accent-cyan shadow-glow' : 'bg-white/5'} rounded-t-2xl relative group`} style={{ height }}>
      {label && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-bg-primary text-[10px] font-bold px-2 py-1 rounded">
          {label}
        </div>
      )}
    </div>
  )
}

function QuickNavLink({ icon, label, href, color }: { icon: string, label: string, href: string, color: 'cyan' | 'purple' }) {
  return (
    <Link href={href} className="glass-card p-5 flex flex-col gap-4 group hover:shadow-glow transition-all">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
        color === 'cyan' ? 'bg-accent-cyan-dim text-accent-cyan' : 'bg-accent-purple-dim text-accent-purple'
      }`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="font-headline font-bold text-white group-hover:text-accent-cyan transition-colors">{label}</span>
    </Link>
  )
}
