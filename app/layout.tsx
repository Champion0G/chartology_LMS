import type { Metadata } from 'next'
import InteractiveCursor from '@/components/InteractiveCursor'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Chartology LMS — Learning Solutions',
    template: '%s | Chartology LMS',
  },
  description: 'Learning management platform for Chartology students. Track assignments, submit doubts, and monitor your progress.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <InteractiveCursor />
        {children}
      </body>
    </html>
  )
}
