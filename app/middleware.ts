import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getToken } from 'next-auth/jwt'

// Rate limiting for API routes
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth')
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isApiRoute = req.nextUrl.pathname.startsWith('/api')

    // Rate limiting for API routes
    if (isApiRoute) {
      const ip = req.ip ?? '127.0.0.1'
      const { success } = await ratelimit.limit(ip)

      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': '10',
          },
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
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization in the middleware function
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/:path*',
    '/api/:path*',
    '/checkout/:path*',
    '/account/:path*',
  ],
}