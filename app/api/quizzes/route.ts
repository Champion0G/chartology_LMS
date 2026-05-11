import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  if (session.role === 'STUDENT') {
    const active = await prisma.quiz.findFirst({
      where: { isActive: true },
      include: { questions: { select: { id: true, text: true, options: true } } }
    })
    return NextResponse.json(active || null)
  }

  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: 'desc' },
    include: { questions: true }
  })
  return NextResponse.json(quizzes)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { title, questions, timePerQuestion } = await request.json()

  const quiz = await prisma.quiz.create({
    data: {
      title,
      timePerQuestion: timePerQuestion ? parseInt(timePerQuestion) : 30,
      createdBy: session.userId,
      questions: {
        create: questions.map((q: any) => ({
          text: q.text,
          options: q.options,
          correctOption: q.correctOption || 0
        }))
      }
    }
  })

  return NextResponse.json(quiz)
}

