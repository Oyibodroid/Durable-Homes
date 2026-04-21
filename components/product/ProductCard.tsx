'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@prisma/client'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import {
  ShoppingCart,
  Package,
  Ruler,
  Weight,
  Truck,
  Star,
  ShoppingBag,
} from 'lucide-react'
import { toast } from '../ui/Toast'

interface ProductCardProps {
  product: Product & {
    images?: any[]
    category?: { name: string } | null
    _count?: { reviews: number }
  }
  priority?: boolean
  layout?: 'grid' | 'list'
}

export function ProductCard({ product, priority = false, layout = 'grid' }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)

    try {
      addItem(
        {
          ...product,
          price: Number(product.price),
          images: product.images || [],
          category: product.category || null,
        },
        1
      )
      toast.success(`${product.name} added to cart!`)
      setTimeout(() => setIsLoading(false), 500)
    } catch (error) {
      toast.error('Failed to add item to cart')
      setIsLoading(false)
    }
  }

  const discount = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.price)) /
          Number(product.compareAtPrice)) *
          100
      )
    : 0

  const stockStatus =
    product.quantity > 10
      ? 'In Stock'
      : product.quantity > 0
      ? 'Low Stock'
      : 'Out of Stock'
  const stockColor =
    product.quantity > 10
      ? 'text-green-600'
      : product.quantity > 0
      ? 'text-yellow-600'
      : 'text-red-600'

  const weight = (product as any).weight || '2.5kg'
  const dimensions = (product as any).dimensions || '50x40x30cm'

  const getProductImage = () => {
    if (imageError) return '/images/industrial-placeholder.jpg'
    const images = product.images
    if (images && Array.isArray(images) && images.length > 0) {
      const firstImage = images[0]
      const imageUrl =
        typeof firstImage === 'string' ? firstImage : firstImage?.url
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        return imageUrl
      }
    }
    return '/images/industrial-placeholder.jpg'
  }

  // ── List Layout ─────────────────────────────────────────────────────────────
  if (layout === 'list') {
    return (
      <div className="group bg-white border border-gray-200 hover:border-yellow-500 transition-all duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <Link href={`/shop/${product.slug}`} className="md:w-64 flex-shrink-0">
            <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden bg-gray-100">
              <Image
                src={getProductImage()}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 256px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority={priority}
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 left-3">
                <div className={`flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm border-l-2 border-yellow-500 text-xs font-medium ${stockColor}`}>
                  <Package className="h-3 w-3" />
                  {stockStatus}
                </div>
              </div>
              {discount > 0 && (
                <div className="absolute top-3 right-3">
                  <div className="bg-red-600 text-white text-xs font-bold px-2 py-1">
                    -{discount}% OFF
                  </div>
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 p-5 flex flex-col">
            <Link
              href={`/shop?category=${product.categoryId}`}
              className="text-xs uppercase tracking-wider text-gray-500 hover:text-yellow-600 mb-2"
            >
              {product.category?.name || 'Building Materials'}
            </Link>

            <Link href={`/shop/${product.slug}`}>
              <h3 className="font-bold text-lg text-gray-900 hover:text-yellow-600 transition-colors line-clamp-2 mb-2">
                {product.name}
              </h3>
            </Link>

            {product.shortDescription && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {product.shortDescription}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-sm font-medium">{weight}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Dimensions</p>
                  <p className="text-sm font-medium">{dimensions}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product._count?.reviews || 0} reviews)
              </span>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₦{Number(product.price).toLocaleString()}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₦{Number(product.compareAtPrice).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Excl. VAT</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  loading={isLoading}
                  disabled={product.quantity === 0}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-none px-4"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <WishlistButton
                  productId={product.id}
                  className="p-2 border border-gray-300 hover:border-yellow-500"
                  iconClassName="h-4 w-4"
                />
              </div>
            </div>

            {product.quantity > 50 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2">
                <Truck className="h-3 w-3" />
                <span>Bulk order available - Contact for pricing</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Grid Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="group bg-white border border-gray-200 hover:border-yellow-500 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link
        href={`/shop/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-gray-100"
      >
        <Image
          src={getProductImage()}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={priority}
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-2 left-2">
          <div className={`flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium ${stockColor}`}>
            <Package className="h-3 w-3" />
            <span className="hidden sm:inline">{stockStatus}</span>
          </div>
        </div>

        {discount > 0 && (
          <div className="absolute top-2 right-2">
            <div className="bg-red-600 text-white text-xs font-bold px-2 py-1">
              -{discount}%
            </div>
          </div>
        )}

        {/* Wishlist button — visible on hover */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton
            productId={product.id}
            className="p-2 bg-white border border-gray-200 hover:border-yellow-500 shadow-lg"
            iconClassName="h-4 w-4"
          />
        </div>
      </Link>

      <div className="p-3 md:p-4">
        <Link
          href={`/shop?category=${product.categoryId}`}
          className="text-xs uppercase tracking-wider text-gray-500 hover:text-yellow-600"
        >
          {product.category?.name || 'Materials'}
        </Link>

        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-bold text-sm md:text-base text-gray-900 hover:text-yellow-600 transition-colors line-clamp-2 mt-1 mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1">
            <Weight className="h-3 w-3" />
            {weight}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {product.quantity} units
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 md:h-4 md:w-4 ${i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product._count?.reviews || 0})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-bold text-gray-900">
              ₦{Number(product.price).toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-500 line-through hidden sm:inline">
                ₦{Number(product.compareAtPrice).toLocaleString()}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            loading={isLoading}
            disabled={product.quantity === 0}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-none px-2 md:px-3 py-1 text-xs md:text-sm"
          >
            <ShoppingBag className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden md:inline ml-1">Add</span>
          </Button>
        </div>

        {product.quantity > 0 && product.quantity < 10 && (
          <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
            <Package className="h-3 w-3" />
            Only {product.quantity} left
          </p>
        )}
      </div>
    </div>
  )
}