import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(10),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviews = await prisma.review.findMany({
      where: { 
        productId: params.id,
        isApproved: true 
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in to leave a review' },
      { status: 401 }
    )
  }

  try {
    const json = await request.json()
    const body = reviewSchema.parse(json)

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: params.id,
          userId: session.user.id,
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        rating: body.rating,
        title: body.title,
        content: body.content,
        productId: params.id,
        userId: session.user.id,
        isVerified: true, // You can check if user actually purchased
        isApproved: false, // Requires admin approval
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}