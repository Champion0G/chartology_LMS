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
          background: radial-gradient(circle, rgba(0, 209, 255, 0.25) 0%, rgba(173, 0, 255, 0.08) 45%, rgba(0,0,0,0) 70%);
          transform-origin: center center;
          margin-left: -75px;
          margin-top: -75px;
          transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
          mix-blend-mode: screen;
        }

        .cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 6px;
          height: 6px;
          background: #00D1FF;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          margin-left: -3px;
          margin-top: -3px;
          transition: transform 0.05s linear, width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
          box-shadow: 0 0 8px rgba(0, 209, 255, 0.9), 0 0 20px rgba(0, 209, 255, 0.4);
        }

        .cursor-dot-hover {
          width: 22px;
          height: 22px;
          margin-left: -11px;
          margin-top: -11px;
          background: transparent;
          border: 1.5px solid #00D1FF;
          box-shadow: 0 0 12px rgba(0, 209, 255, 0.6), inset 0 0 8px rgba(0, 209, 255, 0.08);
        }
      `}</style>
    </>
  )
}
