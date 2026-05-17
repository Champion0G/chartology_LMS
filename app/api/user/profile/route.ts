import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, email, currentPassword, newPassword } = await request.json()

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const updateData: any = { name, email }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 })
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
    }
    updateData.password = await bcrypt.hash(newPassword, 10)
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, name: true, email: true },
    })
    return NextResponse.json(updatedUser)
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email is already taken' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
