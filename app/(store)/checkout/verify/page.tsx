export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  // Get the base application URL to avoid relative redirection failures in production environments
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://durablehomes.vercel.app"

  if (!reference) {
    return NextResponse.redirect(new URL('/cart?error=missing_reference', baseUrl))
  }

  try {
    // 1. Locate the pending database payment tracking row
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { order: true }
    })

    if (!payment) {
      console.error(`Verification targeted a non-existent payment ledger row: ${reference}`)
      return NextResponse.redirect(new URL(`/cart?error=payment_not_found`, baseUrl))
    }

    // Short-circuit if the webhook or a past request already completed processing
    if (payment.status === 'COMPLETED') {
      return NextResponse.redirect(new URL(`/orders/success?orderId=${payment.orderId}`, baseUrl))
    }

    // 2. Validate with Paystack via Outbound Server Side API Hook
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
    })

    const paystackData = await paystackResponse.json()

    // 3. Evaluate Verification Status Matrix from Gateway payload
    if (paystackResponse.ok && paystackData.status && paystackData.data.status === 'success') {
      
      // Execute atomically inside an internal database transaction
      await prisma.$transaction([
        // Update core tracking layer record
        prisma.payment.update({
          where: { reference },
          data: { status: 'COMPLETED' },
        }),
        // Upgrade core order system rows
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'PROCESSING', // Move past pending stage to clear processing metrics
            paidAt: new Date(),
          },
        })
      ])

      // Redirect client browser window session directly to checkout success path
      return NextResponse.redirect(new URL(`/orders/success?orderId=${payment.orderId}`, baseUrl))
    } else {
      // Handle failed verification at paystack level
      await prisma.payment.update({
        where: { reference },
        data: { status: 'FAILED' },
      })

      return NextResponse.redirect(new URL(`/checkout?error=payment_failed&ref=${reference}`, baseUrl))
    }

  } catch (error) {
    console.error('Critical verification transaction route crash:', error)
    // Fall back safely to standard error configurations
    return NextResponse.redirect(new URL(`/cart?error=verification_exception`, baseUrl))
  }
}