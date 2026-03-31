import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { prisma } from '@/lib/db'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, level: true, xp: true },
  })

  if (!user) redirect('/login')

  return (
    <div className="layout-wrapper">
      <Sidebar
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          level: user.level,
          xp: user.xp,
        }}
      />
      <main className="layout-main">
        {children}
      </main>
    </div>
  )
}
