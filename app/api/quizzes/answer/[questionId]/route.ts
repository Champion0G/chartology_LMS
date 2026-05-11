import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { selectedOption } = await request.json()
  const resolvedParams = await params

  const question = await prisma.question.findUnique({ where: { id: resolvedParams.questionId } })
  if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isCorrect = question.correctOption === selectedOption

  return NextResponse.json({ isCorrect, correctOption: question.correctOption })
}
