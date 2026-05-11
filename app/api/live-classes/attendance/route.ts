import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

// GET /api/live-classes/attendance?classId=xxx
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId')

  if (!classId) return NextResponse.json({ error: 'classId is required' }, { status: 400 })

  const attendances = await prisma.attendance.findMany({
    where: { classId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { joinedAt: 'asc' },
  })

  return NextResponse.json(attendances)
}
