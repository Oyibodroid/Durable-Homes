import { auth } from '@/lib/auth'          // ✅ your auth config (adjust path if needed)
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiting for API routes
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export default auth(async (req) => {     // ✅ use auth() directly
  const { pathname } = req.nextUrl
  const token = req.auth                  // ✅ session/token available here (no getToken needed)
  const isAuth = !!token
  const isAuthPage = pathname.startsWith('/auth')
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiRoute = pathname.startsWith('/api')

  // Rate limiting for API routes
  if (isApiRoute) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: { 'Retry-After': '10' },
      })
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protect admin routes
  if (isAdminRoute && (!isAuth || token?.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/api/:path*',
    '/checkout/:path*',
    '/account/:path*',
  ],
}