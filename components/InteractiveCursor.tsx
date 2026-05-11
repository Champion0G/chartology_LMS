'use client'

import { useEffect, useState } from 'react'

export default function InteractiveCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const updatePosition = (e: MouseEvent) => {
      if (isMobile) return
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseOver = (e: MouseEvent) => {
      if (isMobile) return
      const target = e.target as HTMLElement
      // Detect if we are hovering over clickable elements or cards
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.glass-card')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', updatePosition)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [isMobile])

  if (isMobile) return (
    <style jsx global>{`
      body, a, button, input, textarea, [role="button"] {
        cursor: auto !important;
      }
    `}</style>
  )

  return (
    <>
      <div 
        className="cursor-glow"
        style={{
          transform: `translate3d(calc(${position.x}px - 50%), calc(${position.y}px - 50%), 0)`,
          width: isHovering ? '180px' : '80px',
          height: isHovering ? '180px' : '80px',
          opacity: isHovering ? 0.5 : 0.3,
        }}
      />
      <div 
        className={`cursor-dot ${isHovering ? 'cursor-dot-hover' : ''}`}
        style={{
          transform: `translate3d(calc(${position.x}px - 50%), calc(${position.y}px - 50%), 0)`,
        }}
      />
      <style jsx global>{`
        /* Hide default body cursor but keep interactivity */
        @media (hover: hover) and (pointer: fine) {
          body, * {
            cursor: none !important;
          }
          
          /* Fallback for components holding manual cursors */
          a, button, input, textarea, [role="button"] {
            cursor: none !important;
          }
        }

        .cursor-glow {
          position: fixed;
          top: 0; left: 0;
          pointer-events: none;
          z-index: 9999998;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(153, 27, 27, 0.1) 40%, rgba(0,0,0,0) 70%);
          transform-origin: center center;
          transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
          /* translate(-50%, -50%) ensures perfect centering without margin offsets */
        }

        .cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999999;
          transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, border 0.2s ease;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8), 0 0 15px var(--accent-red);
          /* translate(-50%, -50%) ensures perfect centering without margin offsets */
        }

        .cursor-dot-hover {
          width: 10px;
          height: 10px;
          background: white;
          border: 2px solid var(--accent-red);
          box-shadow: 0 0 20px var(--accent-red);
        }
      `}</style>
    </>
  )
}
