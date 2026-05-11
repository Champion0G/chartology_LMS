import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assignments = await prisma.assignment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { name: true } },
      _count: { select: { submissions: true, quizSubmissions: true } },
      assignmentQuestions: { orderBy: { order: 'asc' } },
    },
  })

  // If student, include their submission status
  if (session.role === 'STUDENT') {
    const submissions = await prisma.submission.findMany({
      where: { studentId: session.userId },
      select: { assignmentId: true, grade: true, submittedAt: true, feedback: true },
    })
    const subMap = Object.fromEntries(submissions.map((s: any) => [s.assignmentId, s]))

    const quizSubmissions = await prisma.quizSubmission.findMany({
      where: { studentId: session.userId },
      select: { assignmentId: true, score: true, submittedAt: true, feedback: true, answers: true },
    })
    const quizSubMap = Object.fromEntries(quizSubmissions.map((s: any) => [s.assignmentId, s]))

    return NextResponse.json(
      assignments.map((a: any) => ({
        ...a,
        submission: a.type === 'FILE' ? (subMap[a.id] || null) : (quizSubMap[a.id] ? { ...quizSubMap[a.id], grade: quizSubMap[a.id].score } : null),
      }))
    )
  }

  return NextResponse.json(assignments)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'TEACHER' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, description, deadline, fileUrl, fileName, type, questions } = await request.json()
  if (!title || !description || !deadline) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const assignmentType = type || 'FILE';

  const assignment = await prisma.assignment.create({
    data: {
      title,
      description,
      type: assignmentType,
      deadline: new Date(deadline),
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      createdBy: session.userId,
      ...(questions && questions.length > 0 && {
        assignmentQuestions: {
          create: questions.map((q: any, idx: number) => ({
            order: idx,
            text: q.text,
            options: q.options || [],
            correctOption: q.correctOption !== undefined ? q.correctOption : -1,
            timeLimit: q.timeLimit ? parseInt(q.timeLimit) : 30,
          }))
        }
      })
    },
  })

  // Notify all students
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } })
  if (students.length > 0) {
    await prisma.notification.createMany({
      data: students.map((s: { id: string }) => ({
        userId: s.id,
        title: 'New Assignment',
        message: `A new assignment "${title}" has been posted.`,
        link: '/assignments',
      }))
    })
  }

  return NextResponse.json(assignment, { status: 201 })
}

