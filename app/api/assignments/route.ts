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
      _count: { select: { submissions: true } },
    },
  })

  // If student, include their submission status
  if (session.role === 'STUDENT') {
    const submissions = await prisma.submission.findMany({
      where: { studentId: session.userId },
      select: { assignmentId: true, grade: true, submittedAt: true, feedback: true },
    })
    const subMap = Object.fromEntries(submissions.map((s: any) => [s.assignmentId, s]))

    return NextResponse.json(
      assignments.map((a: any) => ({
        ...a,
        submission: subMap[a.id] || null,
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

  const { title, description, deadline, fileUrl, fileName } = await request.json()
  if (!title || !description || !deadline) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const assignment = await prisma.assignment.create({
    data: {
      title,
      description,
      deadline: new Date(deadline),
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      createdBy: session.userId,
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
