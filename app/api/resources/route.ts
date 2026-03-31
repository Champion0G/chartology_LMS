import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(resources)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'TEACHER' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, videoUrl, description } = await request.json()
  if (!title || !videoUrl) {
    return NextResponse.json({ error: 'Title and video URL required' }, { status: 400 })
  }

  const resource = await prisma.resource.create({
    data: { title, videoUrl, description: description || '' },
  })

  return NextResponse.json(resource, { status: 201 })
}
