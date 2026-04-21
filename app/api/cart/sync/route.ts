import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const cartItemSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    sku: z.string().optional(),
    images: z.any().optional(),
    category: z.any().optional(),
  }),
  quantity: z.number().min(1),
})

/**
 * POST /api/cart/sync
 *
 * REPLACES the user's cart in the database with exactly what is sent.
 * Called on every mutation (addItem, removeItem, updateQuantity, clearCart)
 * from the Zustand store. Never merges — the frontend is the source of truth.
 */
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await request.json()

    // Allow empty array — means clear the cart
    const validatedItems = z.array(cartItemSchema).parse(items ?? [])

    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      })
    }

    // Replace all cart items in a single transaction
    await prisma.$transaction(async (tx) => {
      // Wipe existing items
      await tx.cartItem.deleteMany({ where: { cartId: cart!.id } })

      // Insert exactly what the frontend sent — no merging
      for (const item of validatedItems) {
        await tx.cartItem.create({
          data: {
            cartId: cart!.id,
            productId: item.product.id,
            quantity: item.quantity,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to sync cart:', error)
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
  }
}