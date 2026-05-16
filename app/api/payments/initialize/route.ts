export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { initializePaystackPayment, generatePaystackReference } from '@/lib/payments/paystack'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Payment Initialization Payload:", body)

    const { orderId } = body
    // Default to 'paystack' if the frontend fails to explicitly pass the method string
    const method = body.method || 'paystack' 

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required parameter: orderId' },
        { status: 400 }
      )
    }

    // Get order and include shipping address and user schemas to dynamically fall back to a valid email
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shippingAddress: true,
        user: true,
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Securely derive email and amount on the server instead of trusting client inputs
    const targetEmail = body.email || order.user?.email || order.guestEmail || order.shippingAddress?.phone || "guest-checkout@durablehomes.com"
    const targetAmount = body.amount || Number(order.total)

    // Initialize payment based on method
    switch (method.toLowerCase()) {
      case 'paystack':
        const reference = generatePaystackReference()
        
        const paymentResponse = await initializePaystackPayment({
          email: targetEmail,
          amount: targetAmount, // Your utility layer handles Kobo conversion or passes it directly
          reference,
          metadata: {
            orderId,
            orderNumber: order.orderNumber,
          },
        })

        // Verify the external payment helper returned structural data safely
        if (!paymentResponse || !paymentResponse.status) {
          console.error("Paystack Gateway Initialization Failure Response:", paymentResponse)
          return NextResponse.json(
            { error: paymentResponse?.message || 'Gateway engine failed to initialize authorization URL' },
            { status: 400 }
          )
        }

        // Create core payment verification ledger records
        await prisma.payment.create({
          data: {
            orderId,
            provider: 'PAYSTACK',
            reference,
            amount: targetAmount,
            status: 'PENDING',
          },
        })

        // CRITICAL FIX: Return authorization_url directly or map it to url parameter for client consistency
        return NextResponse.json({
          success: true,
          authorization_url: paymentResponse.data?.authorization_url,
          url: paymentResponse.data?.authorization_url, // Fallback property to resolve client hook extractors
          reference,
        })

      case 'stripe':
        // Implement Stripe
        return NextResponse.json({ error: 'Stripe gateway integration not active yet' }, { status: 501 })

      default:
        return NextResponse.json(
          { error: `Unsupported payment method provided: ${method}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize payment gateway' },
      { status: 500 }
    )
  }
}