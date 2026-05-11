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

  const { grade, feedback } = await request.json()
  if (grade === undefined) return NextResponse.json({ error: 'Grade required' }, { status: 400 })

  const resolvedParams = await params

  const submission = await prisma.quizSubmission.update({
    where: { id: resolvedParams.id },
    data: { score: grade, feedback },
    include: { assignment: true }
  })

  // Award XP based on grade
  await awardGradeXP(submission.studentId, grade)

  // Notify student
  await prisma.notification.create({
    data: {
      userId: submission.studentId,
      title: 'Assignment Graded',
      message: `Your assignment "${submission.assignment.title}" has been graded: ${grade}%`,
      link: '/assignments',
    }
  })

  return NextResponse.json(submission)
}
