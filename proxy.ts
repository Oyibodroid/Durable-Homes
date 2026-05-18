import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limit";

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.paystack.com https://*.flutterwave.com https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " + 
    "font-src 'self' data: https://fonts.gstatic.com; " + 
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://*.paystack.com https://*.flutterwave.com https://api.stripe.com;"
  );
  return response;
}

async function handleRateLimit(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/auth") || !path.startsWith("/api/")) return null;

  const ip =
    (request as any).ip ??
    request.headers.get("x-forwarded-for") ??
    "anonymous";
  let limitType: "strict" | "api" | "auth" | "webhook" = "api";

  if (path.startsWith("/api/payments/webhook")) limitType = "webhook";
  else if (path.startsWith("/api/checkout")) limitType = "strict";

  try {
    const result = await rateLimit(`${ip}:${path}`, limitType);
    if (!result.success) {
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": result.reset.toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      });
    }
    // Return null if rate limit passes so execution continues naturally
    return null; 
  } catch (error) {
    console.error("Rate limit error:", error);
    return null;
  }
}

const PUBLIC_CHECKOUT_PATHS = ["/checkout/verify", "/checkout/success"];

export default auth(async (req) => {
  const path = req.nextUrl.pathname;
  const method = req.method; // Capture HTTP method to protect mutations
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  // 1. RUN RATE LIMITER
  const rateLimitResult = await handleRateLimit(req);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult; // Stop execution and return 429 response if blocked
  }

  // 2. ABSOLUTE EXEMPTIONS
  if (
    path.startsWith("/api/auth") ||
    path === "/api/settings/maintenance-status" ||
    path.startsWith("/api/admin/settings") || // Added to protect settings updates
    path === "/maintenance" ||
    path.startsWith("/_next") ||
    path.includes(".") 
  ) {
    return NextResponse.next();
  }

  // 3. MAINTENANCE CHECK
  // Fix: Only evaluate page layouts (GET requests). Skip APIs and Admin mutations.
  if (!path.startsWith("/admin") && !path.startsWith("/api") && method === "GET") {
    try {
      const maintenanceResponse = await fetch(
        new URL("/api/settings/maintenance-status", req.url),
        {
          next: { revalidate: 0 }, 
        },
      );

      if (maintenanceResponse.ok) {
        const { isMaintenance } = await maintenanceResponse.json();
        if (isMaintenance) {
          return NextResponse.redirect(new URL("/maintenance", req.url));
        }
      }
    } catch (error) {
      console.error("Maintenance check failed:", error);
    }
  }

  // 4. ROLE-BASED ACCESS (Admin & Account)
  if (path.startsWith("/admin")) {
    if (!isLoggedIn)
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    if (user?.role !== "ADMIN")
      return NextResponse.redirect(new URL("/", req.url));
  }

  if (path.startsWith("/account") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // 5. FINAL RESPONSE WITH HEADERS
  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|public/|api/auth|api/payments/webhook).*)",
  ],
};