import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().min(10, 'Review must be at least 10 characters').max(2000),
})

/**
 * GET /api/reviews?productId=xxx
 * Returns the current user's eligibility to review a product:
 * - hasPurchased: has a completed order containing this product
 * - hasReviewed: already submitted a review
 * - existingReview: their review if it exists
 */
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ eligible: false, reason: 'not_logged_in' })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 })
    }

    // Check if user has a completed/delivered order with this product
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          paymentStatus: 'COMPLETED',
        },
      },
    })

    if (!purchase) {
      return NextResponse.json({
        eligible: false,
        reason: 'not_purchased',
      })
    }

    // Check for existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json({
        eligible: false,
        reason: 'already_reviewed',
        existingReview,
      })
    }

    return NextResponse.json({ eligible: true })
  } catch (error) {
    console.error('Review eligibility check failed:', error)
    return NextResponse.json({ eligible: false, reason: 'error' })
  }
}

/**
 * POST /api/reviews
 * Submits a review — only allowed for verified purchasers.
 * Review is created with isApproved: false — admin must approve.
 */
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, title, content } = reviewSchema.parse(body)

    // Verify the user has purchased this product
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          paymentStatus: 'COMPLETED',
        },
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'You can only review products you have purchased' },
        { status: 403 }
      )
    }

    // Prevent duplicate reviews
    const existing = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title: title ?? null,
        content,
        isVerified: true,   // purchased — verified
        isApproved: false,  // awaits admin approval
      },
    })

    return NextResponse.json({
      success: true,
      review,
      message: 'Your review has been submitted and is awaiting approval.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Review submission failed:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}