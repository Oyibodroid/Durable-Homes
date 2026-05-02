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
 * POST /api/cart/merge
 *
 * Called ONCE on login by CartProvider.
 *
 * Merge strategy — DB is the source of truth:
 * - If a product exists in DB → keep DB quantity (ignore local)
 * - If a product only exists locally → add it to the DB cart
 * - Never add quantities together — that causes the doubling bug
 *
 * This means if the user added items on another device, those are
 * preserved. Local-only items (added as guest) are brought in.
 */
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items: localItems } = await request.json()
    const validatedLocalItems = z.array(cartItemSchema).parse(localItems ?? [])

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: { items: true },
      })
    }

    // Build a map of what's in the DB already
    const dbQuantities = new Map<string, number>()
    for (const item of cart.items) {
      dbQuantities.set(item.productId, item.quantity)
    }

    // Only bring in local items that DON'T exist in DB yet
    // Never touch quantities of items already in DB
    const itemsToAdd = validatedLocalItems.filter(
      (item) => !dbQuantities.has(item.product.id)
    )

    if (itemsToAdd.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const item of itemsToAdd) {
          await tx.cartItem.create({
            data: {
              cartId: cart!.id,
              productId: item.product.id,
              quantity: item.quantity,
            },
          })
        }
      })
    }

    // Return the full merged cart with product details
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
                category: true,
              },
            },
          },
        },
      },
    })

    const cartItems = updatedCart?.items.map((item) => ({
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
      quantity: item.quantity,
    })) ?? []

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error('Failed to merge cart:', error)
    return NextResponse.json({ error: 'Failed to merge cart' }, { status: 500 })
  }
}