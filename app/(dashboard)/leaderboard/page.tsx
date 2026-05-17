import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Trophy, Medal, Award } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leaderboard | Chartology' }

export default async function LeaderboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: [
      { level: 'desc' },
      { xp: 'desc' }
    ],
    take: 50,
    select: { id: true, name: true, level: true, xp: true, dp: true }
  })

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28, width: '100%' }}>
        <Trophy size={28} style={{ color: '#f59e0b' }} />
        <div style={{ textAlign: 'center' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Top performers based on Level and XP</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', width: '80px' }}>Rank</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Student</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', width: '120px' }}>Level</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)', width: '120px' }}>Total XP</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student: any, idx: number) => {
                const isCurrentUser = student.id === session.userId
                
                let rankIcon = null
                if (idx === 0) rankIcon = <Trophy size={18} style={{ color: '#f59e0b' }} />
                else if (idx === 1) rankIcon = <Medal size={18} style={{ color: '#94a3b8' }} />
                else if (idx === 2) rankIcon = <Award size={18} style={{ color: '#b45309' }} />

                return (
                  <tr key={student.id} style={{ 
                    borderBottom: '1px solid var(--border)',
                    background: isCurrentUser ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                    transition: 'background 0.2s',
                  }}>
                    <td style={{ padding: '16px 20px', fontWeight: 700, fontSize: 16, color: idx < 3 ? '#fff' : 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {rankIcon || <span style={{ width: 18, textAlign: 'center' }}>{idx + 1}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {student.dp ? <img src={student.dp} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, color: isCurrentUser ? 'var(--accent-purple)' : '#fff' }}>{student.name}</span>
                          {isCurrentUser && <span style={{ marginLeft: 8, fontSize: 10, background: 'var(--accent-purple)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>You</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600 }}>Lv. {student.level}</td>
                    <td style={{ padding: '16px 20px', textAlign: 'right', color: 'var(--accent-blue)', fontWeight: 700 }}>{student.xp} XP</td>
                  </tr>
                )
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No students found to rank.
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
