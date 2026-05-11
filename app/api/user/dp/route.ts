import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { dpUrl } = await request.json()

    if (typeof dpUrl !== 'string' && dpUrl !== null) {
      return NextResponse.json({ error: 'Invalid DP URL' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { dp: dpUrl },
      select: { dp: true },
    })

    return NextResponse.json({ dp: user.dp })
  } catch (error) {
    console.error('Error updating DP:', error)
    return NextResponse.json({ error: 'Failed to update Profile Picture' }, { status: 500 })
  }
}
