'use client'

import dynamic from 'next/dynamic'

// ssr:false is only allowed inside Client Components in the App Router
const RoomClient = dynamic(() => import('@/components/live/RoomClient'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #3b82f6, #a855f7, #ef4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>Loading classroom...</p>
      </div>
    </div>
  ),
})

interface Props {
  classId: string
  className: string
}

export default function RoomClientLoader({ classId, className }: Props) {
  return <RoomClient classId={classId} className={className} />
}
