import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function TeacherTrackerPage() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'TEACHER')) {
    redirect('/dashboard')
  }

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    include: {
      assignments: {
        include: {
          submissions: true,
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return (
    <div className="fade-up">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Teacher Tracker</h1>
          <p className="page-sub">Track assignment creation and submission status per teacher</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {teachers.map((teacher) => {
          const totalAssignments = teacher.assignments.length
          const totalSubmissions = teacher.assignments.reduce((acc, a) => acc + a.submissions.length, 0)
          const totalGraded = teacher.assignments.reduce((acc, a) => acc + a.submissions.filter(s => s.grade !== null).length, 0)
          
          return (
            <div key={teacher.id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 'bold', overflow: 'hidden' }}>
                  {teacher.dp ? <img src={teacher.dp} alt={teacher.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : teacher.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>{teacher.name}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>{teacher.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '24px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assignments</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{totalAssignments}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submissions</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{totalSubmissions}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Graded</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--success)' }}>{totalGraded}</div>
                  </div>
                </div>
              </div>

              {teacher.assignments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No assignments created yet.</p>
              ) : (
                <div className="table-container" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Assignment Title</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Type</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Deadline</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Submissions</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacher.assignments.map(assignment => {
                        const subsCount = assignment.submissions.length
                        const gradedCount = assignment.submissions.filter(s => s.grade !== null).length
                        const isClosed = new Date(assignment.deadline) < new Date()
                        return (
                          <tr key={assignment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '16px 12px', fontWeight: 500 }}>{assignment.title}</td>
                            <td style={{ padding: '16px 12px' }}><span className="badge badge-purple">{assignment.type}</span></td>
                            <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{new Date(assignment.deadline).toLocaleDateString()}</td>
                            <td style={{ padding: '16px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', background: 'var(--success)', width: subsCount > 0 ? `${(gradedCount / subsCount) * 100}%` : '0%' }} />
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{gradedCount}/{subsCount}</span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                              {isClosed ? <span className="badge badge-warning">Closed</span> : <span className="badge badge-success">Open</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
