import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ classId: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'TEACHER' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { classId } = await params
  const liveClass = await prisma.liveClass.findUnique({ where: { id: classId } })
  if (!liveClass) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (liveClass.instructorId !== session.userId && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete attendance records first (FK constraint)
  await prisma.attendance.deleteMany({ where: { classId } })
  await prisma.liveClass.delete({ where: { id: classId } })

  return NextResponse.json({ success: true })
}
