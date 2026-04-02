import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { calculateLevel } from '@/lib/xp'
import { Star, FileText, TrendingUp, User, Mail, Calendar, ShieldCheck, Zap, Sparkles, ChevronRight, BookOpen, Fingerprint } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile | Chartology LMS' }

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, xp: true, level: true, createdAt: true },
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

  const xpProgress = user.xp % 100
  const xpToNext = 100 - xpProgress
  
  const rankNames = ['Scholar', 'Adept', 'Sage', 'Master', 'Legend']
  const rank = rankNames[Math.min(user.level - 1, rankNames.length - 1)]

  return (
    <div className="fade-up pb-20">
      {/* Hero Profile Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end mb-16 px-4 md:px-0">
        <div className="md:col-span-8 flex flex-col items-start text-left">
          <div className="flex items-center gap-3 mb-6 bg-accent-cyan-dim border border-accent-cyan/20 px-4 py-1.5 rounded-full">
             <Fingerprint size={14} className="text-accent-cyan" />
             <span className="text-accent-cyan font-bold tracking-[0.2em] text-[10px] uppercase">Institutional Dossier</span>
          </div>
          <h2 className="text-6xl font-extrabold font-headline leading-tight mb-4 text-white tracking-tighter">
            {user.name.split(' ')[0]} <span className="gradient-text">{user.name.split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-text-secondary leading-relaxed text-lg max-w-xl">
             Currently focused on <span className="text-white font-semibold">Advanced Curriculum Path</span>. {user.name.split(' ')[0]} has consistently demonstrated high analytical rigor across {submissions.length} active modules.
          </p>
        </div>
        <div className="md:col-span-4 flex justify-end w-full">
          <div className="glass-card p-8 rounded-3xl w-full md:w-auto text-right bg-white/[0.02]">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">Academic Status</p>
            <div className="flex items-center justify-end gap-3 text-success">
              <span className="font-headline text-3xl font-extrabold tracking-tight">VERIFIED</span>
              <ShieldCheck size={32} className="opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        {/* Performance Chart Card */}
        <div className="col-span-12 lg:col-span-7 glass-card p-8 shadow-glow flex flex-col justify-between h-full">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="font-headline text-xl font-bold text-white">Performance Velocity</h3>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Institutional Average Score</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-4xl font-extrabold text-accent-cyan font-headline tracking-tighter">{avgScore || '—'}%</span>
              <div className="flex items-center gap-1 text-success text-[10px] font-bold uppercase tracking-widest mt-1">
                 <TrendingUp size={12} /> +2.4% vs local avg.
              </div>
            </div>
          </div>
          
          {/* Performance Bar Chart Representation */}
          <div className="relative h-48 w-full flex items-end gap-3 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5 opacity-50" />
            <div className="flex-1 bg-white/5 rounded-t-xl h-32 transition-all hover:bg-accent-cyan/10 group relative">
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">78</div>
            </div>
            <div className="flex-1 bg-white/5 rounded-t-xl h-40 transition-all hover:bg-accent-cyan/10 group relative">
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">82</div>
            </div>
            <div className="flex-1 bg-white/5 rounded-t-xl h-24 transition-all hover:bg-accent-cyan/10 group relative">
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">65</div>
            </div>
            <div className="flex-1 bg-white/5 rounded-t-xl h-44 transition-all hover:bg-accent-cyan/10 group relative">
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">92</div>
            </div>
            <div className="flex-1 bg-accent-cyan-dim border border-accent-cyan/20 rounded-t-xl h-48 transition-all hover:bg-accent-cyan/30 group relative">
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-accent-cyan">{avgScore || 0}</div>
            </div>
          </div>
          <div className="flex justify-between mt-6 text-[10px] font-bold text-text-muted tracking-widest uppercase">
            <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>ACTIVE</span>
          </div>
        </div>

        {/* Level & Assignment Stats */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Current Level Stats */}
          <div className="bg-gradient p-8 rounded-[2rem] shadow-glow relative overflow-hidden h-full flex flex-col justify-between group">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative z-10">
              <span className="text-white/70 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 block">Institutional Proficiency</span>
              <h4 className="text-6xl font-black font-headline text-white tracking-tighter">Lvl {user.level}</h4>
              <p className="text-white/90 text-sm font-semibold tracking-tighter mt-2">{rank}</p>
            </div>
            <div className="relative z-10 mt-8">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">Momentum Capacity</span>
                <span className="text-xs font-bold text-white">{user.xp % 100} / 100 XP</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ width: `${xpProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Module Counter */}
          <div className="glass-card p-8 shadow-glow flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h5 className="font-headline font-bold text-white text-xl">Curriculum Modules</h5>
                <p className="text-xs text-text-muted font-bold tracking-widest uppercase mt-1">Completed this cycle</p>
              </div>
              <div className="bg-accent-cyan-dim border border-accent-cyan/20 text-accent-cyan px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
                 +3 Target Shift
              </div>
            </div>
            <div className="flex items-baseline gap-6">
              <span className="text-6xl font-black font-headline text-white tracking-tighter">{submissions.length}</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">active units</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= submissions.length % 5 ? 'bg-accent-cyan' : 'bg-white/5'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Milestones List */}
      <section className="mt-20">
        <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6 px-4 md:px-0">
          <div>
             <h3 className="text-3xl font-bold font-headline text-white tracking-tight">Recent <span className="gradient-text">Milestones.</span></h3>
             <p className="text-text-secondary text-sm mt-1">A chronical list of your most recent academic achievement units.</p>
          </div>
          <Link href="/assignments" className="text-xs font-bold text-accent-cyan uppercase tracking-widest hover:underline transition-all hidden md:block">Access Full Transcript</Link>
        </div>
        
        <div className="space-y-4">
          {submissions.length > 0 ? submissions.slice(0, 5).map((s) => (
             <div key={s.id} className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-accent-cyan shadow-inner group-hover:scale-110 transition-transform">
                   <FileText size={22} />
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-white text-lg group-hover:text-accent-cyan transition-colors truncate">{s.assignment.title}</h4>
                   <p className="text-sm text-text-muted mt-1 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
                      <Zap size={10} className="text-accent-purple" /> Research Unit Evaluation
                   </p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                   {s.grade !== null ? (
                      <span className={`block font-headline font-extrabold text-2xl tracking-tighter ${s.grade >= 80 ? 'text-success' : 'text-accent-purple'}`}>
                         Grade: {s.grade}%
                      </span>
                   ) : (
                      <span className="block font-headline font-extrabold text-2xl tracking-tighter text-text-muted opacity-50 uppercase text-sm">PENDING</span>
                   )}
                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1 block">ARCHIVE: {new Date(s.submittedAt).toLocaleDateString()}</span>
                </div>
             </div>
          )) : (
            <div className="glass-card p-16 text-center text-text-muted italic border-dashed border-white/10">
               No milestones recorded in this cycle. Complete assignments to populate dossier.
            </div>
          )}
        </div>
      </section>

      {/* Focus Recommended Section */}
      <section className="mt-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-16 overflow-hidden relative group">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-gradient-to-l from-accent-cyan/30 to-transparent pointer-events-none group-hover:opacity-20 transition-opacity" />
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-accent-purple/5 blurred-circle filter blur-[120px] pointer-events-none" />
        
        <div className="md:col-span-8 relative z-10">
          <div className="flex items-center gap-2 mb-6">
             <div className="w-8 h-px bg-accent-cyan" />
             <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-[0.2em]">Contextual Recommendation</span>
          </div>
          <h3 className="text-4xl font-headline font-extrabold text-white mb-6 tracking-tight leading-tight">Recommended Archive: <span className="gradient-text">Statistical Principles.</span></h3>
          <p className="text-text-secondary leading-relaxed text-lg mb-10 max-w-xl">
             Based on your recent engagement patterns in <span className="text-white font-medium italic">Advanced Logic</span>, we suggest entering focus mode for 45 minutes to review core library modules before the next cycle.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/resources" className="btn-primary px-10 py-4 rounded-2xl flex items-center gap-3 group/focus">
               <span>Start Focus Mode</span>
               <ChevronRight size={18} className="group-hover/focus:translate-x-1 transition-transform" />
            </Link>
            <button className="btn-secondary px-8 py-4 rounded-2xl hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest text-text-muted">Dismiss Notification</button>
          </div>
        </div>
        
        <div className="hidden md:flex md:col-span-4 justify-center relative">
           <div className="w-48 h-48 rounded-[2.5rem] bg-gradient p-1 rotate-6 group-hover:rotate-12 transition-transform duration-700 shadow-2xl">
              <div className="w-full h-full rounded-[2.2rem] bg-bg-secondary flex items-center justify-center text-accent-cyan">
                 <BookOpen size={64} className="animate-pulse-glow" />
              </div>
           </div>
           <div className="absolute top-0 right-0 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 -rotate-12 translate-x-4 -translate-y-4 shadow-xl">
              <Zap size={24} className="text-accent-cyan" />
           </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="mt-32 text-center opacity-30 border-t border-white/5 pt-12">
        <div className="flex items-center justify-center gap-2 mb-4">
           <div className="w-8 h-8 rounded-lg bg-gradient p-0.5">
              <div className="w-full h-full rounded-lg bg-bg-primary flex items-center justify-center text-[10px] font-black text-white">C</div>
           </div>
           <span className="font-headline font-bold text-lg text-white">Chartology</span>
        </div>
        <p className="text-[10px] font-bold text-text-muted tracking-[0.4em] uppercase">Precision Educational Systems • EST 2026</p>
      </footer>
    </div>
  )
}
