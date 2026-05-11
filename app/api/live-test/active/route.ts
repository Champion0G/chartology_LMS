import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const active = await prisma.quiz.findFirst({
    where: { isActive: true },
    include: {
      questions: {
        select: { id: true, text: true, options: true },
      },
    },
  })

  if (!active) return NextResponse.json(null, { status: 404 })

  return NextResponse.json({
    id: active.id,
    title: active.title,
    isActive: active.isActive,
    currentQuestionIndex: active.currentQuestionIndex,
    timePerQuestion: active.timePerQuestion,
    totalQuestions: active.questions.length,
    questions: active.questions,
  })
}
