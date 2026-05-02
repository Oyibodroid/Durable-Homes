import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/wishlist — fetch current user's wishlist product IDs
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ items: [] })
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { id: true, productId: true },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
    return NextResponse.json({ items: [] })
  }
}

// POST /api/wishlist — add a product to wishlist
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // upsert — safe to call multiple times
    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        productId,
      },
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist — remove a product from wishlist
export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}