import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { _count: { select: { questions: true } } }
  })

  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (quiz.currentQuestionIndex < quiz._count.questions - 1) {
    const updated = await prisma.quiz.update({
      where: { id },
      data: { currentQuestionIndex: quiz.currentQuestionIndex + 1 }
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json(quiz)
}
