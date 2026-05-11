import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import FaqsClient from './FaqsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'FAQs | Chartology' }

export default async function FaqsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return <FaqsClient role={session.role} />
}
