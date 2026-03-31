import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { awardGradeXP } from '@/lib/xp'

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
  const { grade, feedback } = await request.json()

  if (grade === undefined || grade === null) {
    return NextResponse.json({ error: 'Grade is required' }, { status: 400 })
  }

  if (grade < 0 || grade > 100) {
    return NextResponse.json({ error: 'Grade must be 0–100' }, { status: 400 })
  }

  const submission = await prisma.submission.update({
    where: { id },
    data: { grade, feedback: feedback || null },
  })

  // Award bonus XP for good grade
  await awardGradeXP(submission.studentId, grade)

  // Notify Student
  const assignment = await prisma.assignment.findUnique({ where: { id: submission.assignmentId } })
  if (assignment) {
    await prisma.notification.create({
      data: {
        userId: submission.studentId,
        title: 'Assignment Graded',
        message: `Your instructor has graded "${assignment.title}" and issued ${grade}%.`,
        link: '/assignments',
      }
    })
  }

  return NextResponse.json(submission)
}
