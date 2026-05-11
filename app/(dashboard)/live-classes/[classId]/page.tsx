import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import RoomClientLoader from '@/components/live/RoomClientLoader'

type Props = {
  params: Promise<{ classId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { classId } = await params
  const liveClass = await prisma.liveClass.findUnique({ where: { id: classId } })
  return {
    title: liveClass ? `${liveClass.title} — Live` : 'Live Class',
  }
}

export default async function LiveRoomPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { classId } = await params

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
    select: { id: true, title: true },
  })

  if (!liveClass) notFound()

  return (
    <RoomClientLoader classId={liveClass.id} className={liveClass.title} />
  )
}
