'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, FileText, MessageCircle, Folder, HelpCircle,
  Video, PlayCircle, Trophy, User, Shield, LogOut, Menu, X, Users, Activity
} from 'lucide-react'

type SidebarProps = {
  user: {
    name: string; email: string; role: string
    level: number; xp: number; dp?: string | null
  }
}

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/doubts', label: 'Doubts', icon: MessageCircle },
  { href: '/resources', label: 'Resources', icon: Folder },
  { href: '/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/live-classes', label: 'Live Classes', icon: Video },
  { href: '/live-test', label: 'Live Quiz', icon: PlayCircle },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]
const teacherNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/doubts', label: 'Doubts', icon: MessageCircle },
  { href: '/resources', label: 'Resources', icon: Folder },
  { href: '/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/live-classes', label: 'Live Classes', icon: Video },
  { href: '/live-test', label: 'Live Quiz', icon: PlayCircle },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]
const adminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin', label: 'Admin Panel', icon: Shield },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/teacher-tracker', label: 'Teacher Tracker', icon: Activity },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/doubts', label: 'Doubts', icon: MessageCircle },
  { href: '/resources', label: 'Resources', icon: Folder },
  { href: '/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/live-classes', label: 'Live Classes', icon: Video },
  { href: '/live-test', label: 'Live Quiz', icon: PlayCircle },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => { setIsOpen(false) }, [pathname])

  // Hide sidebar inside the live classroom
  const isInRoom = /^\/live-classes\/.+/.test(pathname)
  if (isInRoom) return null

  const navItems =
    user.role === 'ADMIN' ? adminNav :
      user.role === 'TEACHER' ? teacherNav : studentNav

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // XP progress within the current level (each level = level * 500 XP)
  const xpForLevel = user.level * 500
  const xpPrev = (user.level - 1) * 500
  const xpInLevel = user.xp - xpPrev
  const xpPct = Math.min(100, Math.round((xpInLevel / xpForLevel) * 100))

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }



  const SidebarContent = () => (
    <>
      {/* ── Logo ── */}
      <div className="sb-logo">
        <div className="sb-logo-icon">C</div>
        <div>
          <div className="sb-brand">Chartology</div>
          <div className="sb-brand-sub">Learning Portal</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sb-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className={`sb-item ${active ? 'sb-item-active' : ''}`}>
              <Icon size={18} className="sb-icon" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* ── XP Card ── */}
      <div className="sb-xp-card">
        <p className="sb-xp-label">CURRENT XP</p>
        <div className="sb-xp-row">
          <span className="sb-xp-value">{user.xp.toLocaleString()}</span>
          <span className="sb-xp-level">Level {user.level}</span>
        </div>
        <div className="sb-xp-track">
          <div className="sb-xp-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      {/* ── User + Logout ── */}
      <div className="sb-user">
        <div className="sb-avatar">
          {user.dp
            ? <img src={user.dp} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        <div className="sb-user-info">
          <div className="sb-user-name">{user.name}</div>
          <div className="sb-user-role">{user.role.toLowerCase()}</div>
        </div>
        <button className="sb-logout" onClick={handleLogout} title="Logout">
          <LogOut size={15} />
        </button>
      </div>
    </>
  )

  return (
    <div className="navigation-host">
      {/* Mobile header */}
      <header className="sb-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sb-logo-icon" style={{ width: 30, height: 30, fontSize: 14 }}>C</div>
          <span className="sb-brand" style={{ fontSize: 16 }}>Chartology</span>
        </div>
        <button className="sb-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {isOpen && <div className="sb-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      <style>{`
        /* ── Sidebar shell ── */
        .sidebar {
          width: 240px;
          height: 100vh;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          background: var(--bg-sidebar);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          z-index: 50;
          box-shadow: 4px 0 30px rgba(0,0,0,0.4);
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* ── Logo ── */
        .sb-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 8px 28px;
        }
        .sb-logo-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #ef4444, #991b1b);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 18px; color: #fff;
          flex-shrink: 0;
          font-family: 'Space Grotesk', sans-serif;
          box-shadow: 0 4px 14px rgba(239,68,68,0.4);
        }
        .sb-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800; font-size: 18px;
          background: linear-gradient(to right, #f87171, #ef4444);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.1;
          letter-spacing: -0.3px;
        }
        .sb-brand-sub {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          font-weight: 700;
          margin-top: 2px;
        }

        /* ── Nav ── */
        .sb-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sb-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }
        .sb-item:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(241,245,249,1);
        }
        .sb-item:hover .sb-icon { color: #ffffff; }
        .sb-item-active {
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          font-weight: 600;
          border-right: 2px solid #ef4444;
        }
        .sb-item-active .sb-icon { color: #ffffff; }
        .sb-icon { flex-shrink: 0; transition: color 0.2s; }

        /* ── XP Card ── */
        .sb-xp-card {
          margin: 16px 0 12px;
          padding: 16px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(153,27,27,0.15));
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sb-xp-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #ef4444;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .sb-xp-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 10px;
        }
        .sb-xp-value {
          font-size: 24px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          color: #fff;
          line-height: 1;
        }
        .sb-xp-level {
          font-size: 10px;
          color: rgba(148,163,184,0.7);
        }
        .sb-xp-track {
          height: 5px;
          background: rgba(0,0,0,0.5);
          border-radius: 999px;
          overflow: hidden;
        }
        .sb-xp-fill {
          height: 100%;
          background: linear-gradient(to right, #ef4444, #991b1b);
          border-radius: 999px;
          transition: width 0.6s ease;
          min-width: 4px;
        }

        /* ── User section ── */
        .sb-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 4px 0;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .sb-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444, #991b1b);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #fff;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid rgba(239,68,68,0.3);
        }
        .sb-user-info { flex: 1; min-width: 0; }
        .sb-user-name {
          font-size: 13px; font-weight: 600;
          color: #f1f5f9;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sb-user-role {
          font-size: 10px; color: rgba(148,163,184,0.6);
          text-transform: capitalize; margin-top: 1px;
        }
        .sb-logout {
          background: transparent; border: none;
          color: rgba(148,163,184,0.5); cursor: pointer;
          padding: 6px; border-radius: 8px;
          display: flex; align-items: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .sb-logout:hover { background: rgba(239,68,68,0.1); color: #f87171; }

        /* ── Mobile header ── */
        .sb-mobile-header {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 60px;
          padding: 0 16px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          z-index: 100;
          align-items: center;
          justify-content: space-between;
        }
        .sb-toggle {
          background: transparent; border: none; color: #fff; cursor: pointer;
          display: flex; align-items: center; padding: 6px;
        }
        .sb-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 145;
        }

        @media (max-width: 768px) {
          .sb-mobile-header { display: flex; }
          .sb-overlay { display: block; }
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
            z-index: 150;
            width: 260px;
            background: rgba(5,5,18,0.99);
          }
          .sidebar.open { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
