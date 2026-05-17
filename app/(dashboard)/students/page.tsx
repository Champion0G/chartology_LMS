import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { xp: 'desc' },
  })

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Students Directory</h1>
          <p className="page-sub">View and manage student profiles and activities</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {students.map((student) => (
          <Link href={`/students/${student.id}`} key={student.id} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ cursor: 'pointer', padding: '20px', transition: 'transform 0.2s', backgroundImage: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', overflow: 'hidden' }}>
                  {student.dp ? <img src={student.dp} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : student.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 600 }}>{student.name}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>{student.email}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--accent-purple)' }}>Level {student.level} • {student.xp} XP</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {students.length === 0 && (
          <div className="empty-state glass-card" style={{ gridColumn: '1 / -1' }}>
            <p>No students found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
