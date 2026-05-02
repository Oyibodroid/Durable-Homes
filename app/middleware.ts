import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiting setup
const ratelimit = process.env.UPSTASH_REDIS_REST_URL 
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
    })
  : null;

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const session = req.auth // In v5, req.auth contains the session
  const isAuth = !!session
  const isAuthPage = pathname.startsWith('/auth')
  const isAdminRoute = pathname.startsWith('/admin')
  const isApiRoute = pathname.startsWith('/api')

  // 1. Rate limiting for API routes
  if (isApiRoute && ratelimit) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    try {
      const { success } = await ratelimit.limit(ip)
      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: { 'Retry-After': '10' },
        })
      }
    } catch (e) {
      console.error("Ratelimit error:", e)
    }
  }

  // 2. Redirect authenticated users away from auth pages (login/register)
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // 3. Protect admin routes
  // ✅ FIX: Cast session.user as any to allow the .role check
  if (isAdminRoute) {
    const userRole = (session?.user as any)?.role;
    
    if (!isAuth || userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
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