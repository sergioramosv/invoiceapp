import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // Protected routes - redirect to login if no session
  if (pathname.startsWith('/workspace') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === '/login' || pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/workspace', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/workspace/:path*', '/login', '/signup'],
}
