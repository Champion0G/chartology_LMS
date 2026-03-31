'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  MessageCircle,
  BookOpen,
  User,
  LogOut,
  Shield,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

type SidebarProps = {
  user: {
    name: string
    email: string
    role: string
    level: number
    xp: number
  }
}

const studentNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/doubts', label: 'Doubts', icon: MessageCircle },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
]

const teacherNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/doubts', label: 'Doubts', icon: MessageCircle },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
]

const adminNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin', label: 'Admin Panel', icon: Shield },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Auto-close sidebar on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems =
    user.role === 'ADMIN'
      ? adminNav
      : user.role === 'TEACHER'
      ? teacherNav
      : studentNav

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="navigation-host">
      <header className={`mobile-header ${isOpen ? 'open' : ''}`}>
        <div className="mobile-logo">
          <div className="logo-icon" style={{ width: 32, height: 32, fontSize: 16 }}>C</div>
          <span className="logo-title gradient-text" style={{ fontSize: 18, alignSelf: 'center' }}>Chartology</span>
        </div>
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Navigation">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">C</div>
        <div>
          <div className="logo-title gradient-text">Chartology</div>
          <div className="logo-sub">Learning Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="nav-arrow" />}
            </Link>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role.toLowerCase()}{user.role === 'STUDENT' ? ` · Lv.${user.level}` : ''}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>

      </aside>

      <style jsx>{`
        .sidebar {
          width: 260px;
          min-height: 100vh;
          background: rgba(8, 8, 15, 0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-right: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          flex-direction: column;
          padding: 0;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
          box-shadow: 20px 0 40px rgba(0, 0, 0, 0.2);
        }

        .sidebar::before {
          content: '';
          position: absolute;
          top: 0; bottom: 0; right: 0;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 32px 24px 24px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--gradient);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 20px;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .logo-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 800;
          font-size: 20px;
          line-height: 1.1;
          letter-spacing: -0.5px;
        }

        .logo-sub {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 3px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0 16px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none !important;
          font-size: 14.5px;
          font-weight: 600;
          transition: var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: var(--gradient);
          opacity: 0;
          transition: var(--transition-smooth);
          z-index: -1;
        }

        .nav-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
          transform: translateX(4px);
        }

        .nav-item.active {
          color: #fff;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          left: -1px; top: 15%; bottom: 15%; width: 3px;
          background: var(--accent-purple);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px var(--accent-purple);
        }

        .nav-arrow {
          margin-left: auto;
          opacity: 0.3;
          transition: transform 0.3s ease;
        }
        
        .nav-item:hover .nav-arrow {
          opacity: 0.8;
          transform: translateX(2px);
        }

        .nav-item.active .nav-arrow {
          opacity: 1;
          color: var(--accent-purple);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background: linear-gradient(0deg, rgba(8, 8, 15, 0.8), transparent);
          border-top: 1px solid rgba(255,255,255,0.03);
          margin-top: 20px;
        }

        .user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #fff;
        }

        .user-role {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: capitalize;
          margin-top: 2px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .logout-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
          flex-shrink: 0;
        }

        .logout-btn:hover {
          background: var(--danger-dim);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--danger);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        .mobile-header {
          display: none;
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 64px;
            padding-top: env(safe-area-inset-top, 0);
            box-sizing: content-box;
            background: rgba(8, 8, 15, 0.8);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            z-index: 100;
            align-items: center;
            justify-content: space-between;
            padding-left: 16px;
            padding-right: 16px;
            transition: transform 0.3s ease;
          }

          .mobile-logo {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .mobile-toggle {
            display: flex;
            background: transparent;
            border: none;
            color: #fff;
            width: 40px;
            height: 40px;
            align-items: center;
            justify-content: flex-end;
            cursor: pointer;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 145;
            backdrop-filter: blur(4px);
          }

          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 150;
            width: 280px;
            box-shadow: none;
            height: 100vh;
            height: 100dvh;
            background: rgba(10, 10, 20, 0.98);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .sidebar.open {
            transform: translateX(0);
            box-shadow: 20px 0 60px rgba(0, 0, 0, 0.8);
          }
          
          /* Hide desktop logo in mobile sidebar since it's on the top header now */
          .sidebar-logo {
            display: none;
          }
          .sidebar-nav {
            margin-top: calc(84px + env(safe-area-inset-top, 0));
            flex: none; /* Allow it to not push user section to the absolute bottom if we want it higher */
          }

          .sidebar-user {
            padding: 24px 24px calc(100px + env(safe-area-inset-bottom, 0));
            background: rgba(0, 0, 0, 0.5);
            margin-top: 40px;
          }
          
          .logout-btn {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </div>
  )
}
