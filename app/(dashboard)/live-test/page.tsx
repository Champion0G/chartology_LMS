import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import LiveTestClient from './LiveTestClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Live Quiz | Chartology' }

export default async function LiveTestPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return <LiveTestClient role={session.role} />
}
