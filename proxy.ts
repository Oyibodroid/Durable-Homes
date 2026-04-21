import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from './lib/rate-limit';

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.paystack.com https://*.flutterwave.com https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.paystack.com https://*.flutterwave.com https://api.stripe.com;"
  );
  return response;
}

async function handleRateLimit(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/api/auth') || !path.startsWith('/api/')) return null;

  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  let limitType: 'strict' | 'api' | 'auth' | 'webhook' = 'api';

  if (path.startsWith('/api/payments/webhook')) limitType = 'webhook';
  else if (path.startsWith('/api/checkout')) limitType = 'strict';

  try {
    const result = await rateLimit(`${ip}:${path}`, limitType);
    if (!result.success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': result.reset.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      });
    }
    return result;
  } catch (error) {
    console.error('Rate limit error:', error);
    return null;
  }
}

const PUBLIC_CHECKOUT_PATHS = ['/checkout/verify', '/checkout/success'];

export default auth(async (req) => {
  const path = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  // Inside export default auth(async (req) => { ...

  const isPublicAsset = path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i);

  if (
    !path.startsWith('/admin') && 
    !path.startsWith('/api') && 
    path !== '/maintenance' &&
    !isPublicAsset // <--- ADD THIS: Don't redirect images to the maintenance page!
  ) {
    try {
      const maintenanceCheck = await fetch(new URL('/api/settings/maintenance-status', req.url));
      const data = await maintenanceCheck.json();

      if (data.isMaintenance === true) {
        return NextResponse.redirect(new URL('/maintenance', req.url));
      }
    } catch (error) {
      console.error('Maintenance check failed:', error);
    }
  }

  // 1. Handle rate limiting for API routes first
  let rateLimitResult = null;
  if (path.startsWith('/api/')) {
    rateLimitResult = await handleRateLimit(req);
    if (rateLimitResult instanceof NextResponse) return rateLimitResult;
  }

  // 2. Maintenance Mode Check (Integrated logic)
  // We exclude admin, api, and the maintenance page itself to avoid loops
  if (!path.startsWith('/admin') && !path.startsWith('/api') && path !== '/maintenance') {
    try {
      /** * NOTE: You cannot use Prisma directly here.
       * Instead, we fetch from an internal API route that does have Prisma access.
       */
      const maintenanceCheck = await fetch(new URL('/api/settings/maintenance-status', req.url));
      const { isMaintenance } = await maintenanceCheck.json();

      if (isMaintenance === true) {
        return NextResponse.redirect(new URL('/maintenance', req.url));
      }
    } catch (error) {
      console.error('Maintenance check failed:', error);
    }
  }

  // 3. Role-based access control
  if (path.startsWith('/admin')) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/auth/signin', req.url));
    if (user?.role !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url));
  }

  if (path.startsWith('/account') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // 4. Construct Final Response
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(req.headers),
        'x-pathname': path,
      }),
    },
  });

  // Attach rate limit headers if applicable
  if (rateLimitResult && !(rateLimitResult instanceof NextResponse)) {
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
  }

  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|public/|api/auth|api/payments/webhook).*)',
  ],
};