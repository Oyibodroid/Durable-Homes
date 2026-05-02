import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const validateSchema = z.object({
  code: z.string(),
  subtotal: z.number()
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { code, subtotal } = validateSchema.parse(json)

    // Find promo code in database
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!promo) {
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 400 }
      )
    }

    // Check if promo is active
    if (!promo.isActive) {
      return NextResponse.json(
        { error: 'Promo code is inactive' },
        { status: 400 }
      )
    }

    // Check expiration
    if (promo.validUntil && promo.validUntil < new Date()) {
      return NextResponse.json(
        { error: 'Promo code has expired' },
        { status: 400 }
      )
    }

    // Check minimum purchase
    if (promo.minPurchase && subtotal < promo.minPurchase) {
      return NextResponse.json(
        { error: `Minimum purchase of ₦${promo.minPurchase.toLocaleString()} required` },
        { status: 400 }
      )
    }

    // Calculate discount
    let discountAmount = 0
    if (promo.discountType === 'percentage') {
      discountAmount = (subtotal * promo.discountValue) / 100
    } else {
      discountAmount = promo.discountValue
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal)

    return NextResponse.json({
      valid: true,
      discountAmount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      code: promo.code
    })

  } catch (error) {
    console.error('Failed to validate promo:', error)
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    )
  }
}