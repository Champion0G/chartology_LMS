import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { awardSubmissionXP, awardGradeXP } from '@/lib/xp'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (session.role === 'STUDENT') {
    const submissions = await prisma.submission.findMany({
      where: { studentId: session.userId },
      include: { assignment: { select: { title: true, deadline: true } } },
      orderBy: { submittedAt: 'desc' },
    })
    return NextResponse.json(submissions)
  }

  // Teacher / Admin see all
  const submissions = await prisma.submission.findMany({
    include: {
      student: { select: { name: true, email: true } },
      assignment: { select: { title: true } },
    },
    orderBy: { submittedAt: 'desc' },
  })
  return NextResponse.json(submissions)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Only students can submit' }, { status: 403 })
  }

  const { assignmentId, fileUrl, fileName } = await request.json()
  if (!assignmentId || !fileUrl) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Check deadline
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } })
  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

  // Prevent double submission
  const existing = await prisma.submission.findFirst({
    where: { studentId: session.userId, assignmentId },
  })
  if (existing) return NextResponse.json({ error: 'Already submitted' }, { status: 409 })

  const isLate = new Date() > assignment.deadline

  const submission = await prisma.submission.create({
    data: {
      studentId: session.userId,
      assignmentId,
      fileUrl,
      fileName: fileName || '',
      isLate,
    },
  })

  // Award XP
  await awardSubmissionXP(session.userId, isLate)

  // Notify Teacher
  await prisma.notification.create({
    data: {
      userId: assignment.createdBy,
      title: 'New Submission',
      message: `A student submitted "${assignment.title}".`,
      link: '/assignments',
    }
  })

  return NextResponse.json(submission, { status: 201 })
}
