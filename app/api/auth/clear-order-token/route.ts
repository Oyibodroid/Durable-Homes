import { NextResponse } from 'next/server'

/**
 * POST /api/auth/clear-order-token
 * Called on logout to clear the order_token cookie so
 * the success page can't be accessed after signing out.
 */
export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('order_token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  })
  return response
}