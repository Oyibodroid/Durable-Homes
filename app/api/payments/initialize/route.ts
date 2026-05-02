import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { initializePaystackPayment, generatePaystackReference } from '@/lib/payments/paystack'

export async function POST(request: Request) {
  try {
    const { orderId, method, email, amount } = await request.json()

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    let paymentResponse

    // Initialize payment based on method
    switch (method) {
      case 'paystack':
        const reference = generatePaystackReference()
        
        paymentResponse = await initializePaystackPayment({
          email,
          amount,
          reference,
          metadata: {
            orderId,
            orderNumber: order.orderNumber,
          },
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            orderId,
            provider: 'PAYSTACK',
            reference,
            amount,
            status: 'PENDING',
          },
        })

        return NextResponse.json({
          authorization_url: paymentResponse.data?.authorization_url,
          reference,
        })

      case 'flutterwave':
        // Implement Flutterwave
        break

      case 'stripe':
        // Implement Stripe
        break

      default:
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment' },
      { status: 500 }
    )
  }

}