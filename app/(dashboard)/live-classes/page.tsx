import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import LiveClassesClient from '@/components/live/LiveClassesClient'

export const metadata: Metadata = {
  title: 'Live Classes',
  description: 'Join live video classes with your instructor in real time.',
}

export default async function LiveClassesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <LiveClassesClient role={session.role} userId={session.userId} />
  )
}
