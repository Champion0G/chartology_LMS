import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { awardSubmissionXP } from '@/lib/xp'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const resolvedParams = await params
  const assignmentId = resolvedParams.id
  const { answers } = await request.json() // string[] of text answers

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  })

  if (!assignment || assignment.type !== 'QA') return NextResponse.json({ error: 'Invalid assignment' }, { status: 400 })

  const existing = await prisma.quizSubmission.findFirst({
    where: { studentId: session.userId, assignmentId }
  })
  if (existing) return NextResponse.json({ error: 'Already submitted' }, { status: 409 })

  const isLate = new Date() > assignment.deadline

  const submission = await prisma.quizSubmission.create({
    data: {
      studentId: session.userId,
      assignmentId,
      answers: JSON.stringify(answers),
      isLate,
      score: null // Needs manual grading
    }
  })

  await awardSubmissionXP(session.userId, isLate)

  return NextResponse.json(submission, { status: 201 })
}
