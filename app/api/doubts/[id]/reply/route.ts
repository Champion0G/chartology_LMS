import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'TEACHER' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { reply } = await request.json()

  if (!reply?.trim()) {
    return NextResponse.json({ error: 'Reply is required' }, { status: 400 })
  }

  const doubt = await prisma.doubt.update({
    where: { id },
    data: { reply: reply.trim(), status: 'RESOLVED' },
  })

  // Notify Student
  await prisma.notification.create({
    data: {
      userId: doubt.studentId,
      title: 'Teacher Replied',
      message: `Your doubt "${doubt.question.slice(0, 30)}..." has been answered.`,
      link: '/doubts',
    }
  })

  return NextResponse.json(doubt)
}
