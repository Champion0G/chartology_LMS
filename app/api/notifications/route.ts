import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(notifications)
}

// Mark ALL or ONE as read
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()

  if (id === 'all') {
    await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    })
  } else {
    // Validate ownership before updating
    const notif = await prisma.notification.findUnique({ where: { id } })
    if (notif?.userId === session.userId) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      })
    }
  }

  return NextResponse.json({ success: true })
}
