import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const resolvedParams = await params
  const quizId = resolvedParams.id

  // Fetch all answers for this quiz
  const answers = await prisma.liveQuizAnswer.findMany({
    where: { quizId },
    include: { student: { select: { name: true, dp: true } } }
  })

  // Aggregate scores by studentId
  const scores: Record<string, { studentName: string; score: number; totalTime: number }> = {}

  answers.forEach(ans => {
    if (!scores[ans.studentId]) {
      scores[ans.studentId] = {
        studentName: ans.student.name,
        score: 0,
        totalTime: 0
      }
    }
    
    if (ans.isCorrect) {
      scores[ans.studentId].score += 1
    }
    scores[ans.studentId].totalTime += ans.timeTaken
  })

  // Convert to array and sort by score (desc), then totalTime (asc)
  const leaderboard = Object.values(scores).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.totalTime - b.totalTime
  })

  return NextResponse.json(leaderboard)
}
