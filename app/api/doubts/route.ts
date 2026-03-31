import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.role === 'STUDENT') {
    const doubts = await prisma.doubt.findMany({
      where: { studentId: session.userId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(doubts)
  }

  const doubts = await prisma.doubt.findMany({
    include: { student: { select: { name: true, email: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(doubts)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Only students can submit doubts' }, { status: 403 })
  }

  const { question } = await request.json()
  if (!question?.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  const doubt = await prisma.doubt.create({
    data: { studentId: session.userId, question: question.trim() },
  })

  // Notify all teachers and admins
  const teachers = await prisma.user.findMany({ 
    where: { role: { in: ['TEACHER', 'ADMIN'] } }, 
    select: { id: true } 
  })
  if (teachers.length > 0) {
    await prisma.notification.createMany({
      data: teachers.map((t: { id: string }) => ({
        userId: t.id,
        title: 'New Student Doubt',
        message: `A student has opened a new ticket: "${question.trim().slice(0, 30)}..."`,
        link: '/doubts',
      }))
    })
  }

  return NextResponse.json(doubt, { status: 201 })
}
