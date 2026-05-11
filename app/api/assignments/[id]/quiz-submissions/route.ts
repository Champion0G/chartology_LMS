import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || (session.role !== 'TEACHER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const resolvedParams = await params
  const assignmentId = resolvedParams.id

  const submissions = await prisma.quizSubmission.findMany({
    where: { assignmentId },
    include: {
      student: { select: { name: true, email: true } },
      assignment: { select: { title: true, type: true } },
    },
    orderBy: { submittedAt: 'desc' },
  })

  return NextResponse.json(submissions)
}
