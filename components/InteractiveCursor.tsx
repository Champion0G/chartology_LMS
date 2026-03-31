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
      // Detect if we are hovering over clickable elements
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('glass-card')
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
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: isHovering ? '300px' : '150px',
          height: isHovering ? '300px' : '150px',
          opacity: isHovering ? 0.6 : 0.4,
        }}
      />
      <div 
        className={`cursor-dot ${isHovering ? 'cursor-dot-hover' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
      <style jsx global>{`
        /* Hide default body cursor but keep interactivity */
        @media (hover: hover) and (pointer: fine) {
          body {
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
          z-index: 9998;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 40%, rgba(0,0,0,0) 70%);
          transform-origin: center center;
          margin-left: -75px; /* Offset half of default width */
          margin-top: -75px;  /* Offset half of default height */
          transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
          mix-blend-mode: screen;
        }

        .cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          margin-left: -4px;
          margin-top: -4px;
          transition: transform 0.05s linear, width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px var(--accent-purple);
        }

        .cursor-dot-hover {
          width: 20px;
          height: 20px;
          margin-left: -10px;
          margin-top: -10px;
          background: transparent;
          border: 2px solid var(--accent-blue);
          box-shadow: 0 0 15px var(--accent-blue);
        }
      `}</style>
    </>
  )
}
