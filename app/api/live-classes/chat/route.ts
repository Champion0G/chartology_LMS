import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

// POST /api/live-classes/chat
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { classId, message } = await request.json()
  if (!classId || !message) {
    return NextResponse.json({ error: 'classId and message are required' }, { status: 400 })
  }

  const chatMessage = await prisma.liveChatMessage.create({
    data: {
      classId,
      userId: session.userId,
      message,
    },
    include: {
      user: {
        select: { name: true }
      }
    }
  })

  return NextResponse.json(chatMessage)
}

// GET /api/live-classes/chat?classId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId')

  if (!classId) {
    return NextResponse.json({ error: 'classId is required' }, { status: 400 })
  }

  const messages = await prisma.liveChatMessage.findMany({
    where: { classId },
    include: {
      user: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return NextResponse.json(messages)
}
