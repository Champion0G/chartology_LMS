import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { isActive } = await request.json()
  const resolvedParams = await params

  if (isActive) {
    await prisma.quiz.updateMany({ where: { isActive: true }, data: { isActive: false } })
  }

  const quiz = await prisma.quiz.update({
    where: { id: resolvedParams.id },
    data: { isActive },
    include: { questions: true }
  })

  return NextResponse.json(quiz)
}
