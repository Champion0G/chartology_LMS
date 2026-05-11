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
  const { answers } = await request.json() // number[] of selected indices

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { assignmentQuestions: { orderBy: { order: 'asc' } } }
  })

  if (!assignment || assignment.type !== 'QUIZ') return NextResponse.json({ error: 'Invalid assignment' }, { status: 400 })

  const existing = await prisma.quizSubmission.findFirst({
    where: { studentId: session.userId, assignmentId }
  })
  if (existing) return NextResponse.json({ error: 'Already submitted' }, { status: 409 })

  // Grade the MCQ
  let correctCount = 0
  const totalCount = assignment.assignmentQuestions.length
  
  assignment.assignmentQuestions.forEach((q, idx) => {
    if (answers[idx] === q.correctOption) {
      correctCount++
    }
  })

  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const isLate = new Date() > assignment.deadline

  const submission = await prisma.quizSubmission.create({
    data: {
      studentId: session.userId,
      assignmentId,
      answers: JSON.stringify(answers),
      score,
      isLate
    }
  })

  await awardSubmissionXP(session.userId, isLate)

  return NextResponse.json(submission, { status: 201 })
}
