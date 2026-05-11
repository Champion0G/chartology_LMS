import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { generateRoomName } from '@/lib/livekit/rooms'

// GET /api/live-classes — list all live classes
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const classes = await prisma.liveClass.findMany({
    orderBy: { startTime: 'asc' },
    include: {
      instructor: { select: { name: true, id: true } },
      _count: { select: { attendances: true } },
    },
  })

  return NextResponse.json(classes)
}

// POST /api/live-classes — create a live class (teacher/admin only)
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'TEACHER' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, description, startTime, durationMinutes } = await request.json()

  if (!title || !startTime || !durationMinutes) {
    return NextResponse.json({ error: 'title, startTime and durationMinutes are required' }, { status: 400 })
  }

  const start = new Date(startTime)
  const end = new Date(start.getTime() + Number(durationMinutes) * 60 * 1000)
  const roomName = generateRoomName()

  const liveClass = await prisma.liveClass.create({
    data: {
      title,
      description: description || null,
      roomName,
      instructorId: session.userId,
      startTime: start,
      endTime: end,
    },
    include: {
      instructor: { select: { name: true } },
    },
  })

  // Notify all students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true },
  })

  if (students.length > 0) {
    await prisma.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        title: 'New Live Class Scheduled',
        message: `"${title}" is scheduled for ${start.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.`,
        link: '/live-classes',
      })),
    })
  }

  return NextResponse.json(liveClass, { status: 201 })
}
