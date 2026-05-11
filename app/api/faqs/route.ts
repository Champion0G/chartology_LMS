import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const faqs = await prisma.faq.findMany({
    orderBy: { createdAt: 'desc' },
    include: { teacher: { select: { name: true } } }
  })
  
  return NextResponse.json(faqs)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role === 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { question, answer, videoUrl, link } = await request.json()

  if (!question || !answer) {
    return NextResponse.json({ error: 'Question and answer required' }, { status: 400 })
  }

  const faq = await prisma.faq.create({
    data: { question, answer, videoUrl, link, createdBy: session.userId }
  })

  return NextResponse.json(faq, { status: 201 })
}
