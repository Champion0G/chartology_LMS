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

  const { title, videoUrl, pdfUrl, imageUrl, description } = await request.json()
  if (!title || (!videoUrl && !pdfUrl && !imageUrl)) {
    return NextResponse.json({ error: 'Title and at least one media URL (video/pdf/image) are required' }, { status: 400 })
  }

  const resource = await prisma.resource.create({
    data: { title, videoUrl, pdfUrl, imageUrl, description: description || '' },
  })

  return NextResponse.json(resource, { status: 201 })
}
