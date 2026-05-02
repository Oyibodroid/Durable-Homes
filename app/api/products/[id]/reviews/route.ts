import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().min(10).max(2000),
})

// ✅ GET product reviews eligibility
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ eligible: false, reason: 'not_logged_in' })
    }

    const productId = params.id

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

// ✅ POST create review
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rating, title, content } = reviewSchema.parse(body)

    const productId = params.id

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
        isVerified: true,
        isApproved: false,
      },
    })

    return NextResponse.json({
      success: true,
      review,
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