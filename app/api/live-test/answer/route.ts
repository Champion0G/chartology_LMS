import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { quizId, questionId, answerIndex, timeTaken } = await request.json()

  // Find the question to check if answer is correct
  const question = await prisma.question.findUnique({
    where: { id: questionId }
  })

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 })
  }

  const isCorrect = question.correctOption === answerIndex

  // Upsert the answer (in case of retries, though UI prevents it)
  await prisma.liveQuizAnswer.upsert({
    where: {
      quizId_questionId_studentId: {
        quizId,
        questionId,
        studentId: session.userId,
      }
    },
    update: {
      answerIndex,
      isCorrect,
      timeTaken: timeTaken || 0
    },
    create: {
      quizId,
      questionId,
      studentId: session.userId,
      answerIndex,
      isCorrect,
      timeTaken: timeTaken || 0
    }
  })

  return NextResponse.json({ success: true, isCorrect })
}
