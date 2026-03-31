import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const publicRoutes = ['/login', '/signup']
const adminRoutes = ['/admin']
const teacherRoutes: string[] = []

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = request.cookies.get('session')?.value
  const session = await decrypt(cookie)

  // Redirect unauthenticated users to login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  // Redirect authenticated users away from login/signup
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  // Protect admin routes
  if (session && adminRoutes.some((r) => path.startsWith(r))) {
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
