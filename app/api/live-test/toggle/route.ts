import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, active } = await request.json()

  if (active) {
    // Deactivate any currently active quizzes
    await prisma.quiz.updateMany({ where: { isActive: true }, data: { isActive: false } })
  }

  // Update this quiz and reset its question index when starting
  const quiz = await prisma.quiz.update({
    where: { id },
    data: { 
      isActive: active,
      currentQuestionIndex: active ? 0 : undefined // reset index when starting
    },
    include: { questions: true }
  })

  return NextResponse.json(quiz)
}
