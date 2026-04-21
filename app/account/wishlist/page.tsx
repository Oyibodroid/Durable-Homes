import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Heart, Trash2 } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { WishlistAddToCart } from '@/components/wishlist/WishlistAddToCart'

async function removeFromWishlist(formData: FormData) {
  'use server'

  const session = await auth()
  if (!session) return

  const itemId = formData.get('itemId') as string

  try {
    await prisma.wishlistItem.delete({
      where: { id: itemId },
    })
    revalidatePath('/account/wishlist')
  } catch (error) {
    console.error('Failed to remove from wishlist')
  }
}

export default async function WishlistPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { take: 1, where: { isMain: true } },
          category: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
      <p className="text-gray-600 mb-8">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden group">
              <Link href={`/shop/${item.product.slug}`} className="block relative aspect-square">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <Heart className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </Link>

              <div className="p-4">
                <Link href={`/shop/${item.product.slug}`}>
                  <h3 className="font-medium hover:text-primary transition line-clamp-1">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">{item.product.category?.name}</p>

                <div className="flex items-center justify-between">
                  {/* ✅ Decimal → Number */}
                  <p className="font-bold text-lg">
                    ₦{Number(item.product.price).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    {/* Remove from wishlist */}
                    <form action={removeFromWishlist}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <Button variant="ghost" size="icon" type="submit">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </form>

                    {/* ✅ Client component handles useCart */}
                    <WishlistAddToCart
                      product={{
                        id: item.product.id,
                        name: item.product.name,
                        slug: item.product.slug,
                        price: Number(item.product.price),
                        quantity: item.product.quantity,
                        images: item.product.images,
                        category: item.product.category,
                        sku: item.product.sku,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
          <Link href="/shop">
            <Button>Browse Products</Button>
          </Link>
        </div>
      )}
    </div>
  )
}