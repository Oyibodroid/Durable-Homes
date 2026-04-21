import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/cart - Get user's cart
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ items: [] })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
                category: true
              }
            }
          }
        }
      }
    })

    if (!cart) {
      return NextResponse.json({ items: [] })
    }

    const items = cart.items.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        sku: item.product.sku,
        images: item.product.images,
        category: item.product.category,
        quantity: item.product.quantity,
      },
      quantity: item.quantity
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Failed to fetch cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Clear user's cart
export async function DELETE() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to clear cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}