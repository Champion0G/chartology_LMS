import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { generateLiveKitToken } from '@/lib/livekit/token'

const WINDOW_MINUTES = 15 // how early/late a student can join

// POST /api/live-classes/token
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { classId } = await request.json()
  if (!classId) return NextResponse.json({ error: 'classId is required' }, { status: 400 })

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
  })

  if (!liveClass) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

  const now = new Date()
  const windowStart = new Date(liveClass.startTime.getTime() - WINDOW_MINUTES * 60 * 1000)
  const windowEnd = new Date(liveClass.endTime.getTime() + WINDOW_MINUTES * 60 * 1000)

  const isInstructor = liveClass.instructorId === session.userId
  const isHost = isInstructor || session.role === 'ADMIN'

  // Students can only join within the session window
  if (!isHost && (now < windowStart || now > windowEnd)) {
    return NextResponse.json({ error: 'Session is not currently active' }, { status: 403 })
  }

  // Log attendance for students (check existence first to avoid terminal error noise)
  if (session.role === 'STUDENT') {
    const existing = await prisma.attendance.findUnique({
      where: { userId_classId: { userId: session.userId, classId } }
    })
    if (!existing) {
      try {
        await prisma.attendance.create({
          data: { userId: session.userId, classId },
        })
      } catch (e) {
        // Silently catch race condition if another request created it simultaneously
      }
    }
  }

  const token = await generateLiveKitToken(
    liveClass.roomName,
    session.userId,
    session.name,
    isHost
  )

  return NextResponse.json({
    token,
    wsUrl: process.env.NEXT_PUBLIC_LIVEKIT_WS_URL!,
    roomName: liveClass.roomName,
    className: liveClass.title,
  })
}
