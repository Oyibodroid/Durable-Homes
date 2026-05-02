'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Product } from '@prisma/client'
import { useCart } from '@/hooks/useCart'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { ShoppingCart, Package, Star, Eye } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface ProductCardProps {
  product: Product & {
    images?: any[]
    category?: { name: string } | null
    _count?: { reviews: number }
  }
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { addItem } = useCart()

  const price = Number(product.price)
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null
  const discount = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0

  const stockStatus = product.quantity > 10 ? 'in-stock' : product.quantity > 0 ? 'low' : 'out'
  const stockLabel = product.quantity > 10 ? 'In Stock' : product.quantity > 0 ? `${product.quantity} left` : 'Out of Stock'
  const stockColor = product.quantity > 10 ? 'text-green-600' : product.quantity > 0 ? 'text-amber-600' : 'text-red-500'

  const imageUrl = (() => {
    if (imageError) return null
    const imgs = product.images
    if (!imgs?.length) return null
    const first = imgs[0]
    const url = typeof first === 'string' ? first : first?.url
    return url && url.trim() ? url : null
  })()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (product.quantity === 0) return
    setIsLoading(true)
    addItem({ ...product, price, images: product.images || [], category: product.category || null }, 1)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setIsLoading(false), 400)
  }

  return (
    <div className="group bg-white border border-gray-100 hover:border-[#C9A84C]/40 transition-all duration-300 overflow-hidden relative"
      style={{ boxShadow:'0 1px 3px rgba(0,0,0,0.04)', transition:'all 0.3s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(201,168,76,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}
    >
      {/* Image */}
      <Link href={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#faf9f6]">
        {imageUrl ? (
          <Image src={imageUrl} alt={product.name} fill
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-108"
            style={{ transition:'transform 0.5s ease' }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
            priority={priority}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-200" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5">-{discount}%</span>
          )}
          {product.featured && (
            <span className="bg-[#C9A84C] text-[#111008] text-[10px] font-black px-2 py-0.5">FEATURED</span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <WishlistButton
            productId={product.id}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-[#C9A84C] hover:text-[#111008] transition-colors shadow-md"
            iconClassName="h-4 w-4"
          />
          <Link href={`/shop/${product.slug}`}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-[#C9A84C] transition-colors shadow-md"
            onClick={e => e.stopPropagation()}>
            <Eye className="h-4 w-4 text-gray-700 hover:text-[#111008]" />
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/shop?category=${product.categoryId}`}
          className="text-[10px] text-gray-400 uppercase tracking-wider hover:text-[#C9A84C] transition-colors"
          onClick={e=>e.stopPropagation()}>
          {product.category?.name || 'Materials'}
        </Link>

        <Link href={`/shop/${product.slug}`} className="block mt-1 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#111008] line-clamp-2 leading-snug" style={{ transition:'color 0.2s' }}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_,i) => (
              <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({product._count?.reviews || 0})</span>
        </div>

        {/* Price + Add */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-bold text-gray-900 text-base">₦{price.toLocaleString()}</p>
            {compareAt && (
              <p className="text-xs text-gray-400 line-through mt-0.5">₦{compareAt.toLocaleString()}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.quantity === 0}
            className="w-9 h-9 flex items-center justify-center transition-all duration-200 disabled:opacity-40"
            style={{ background: product.quantity === 0 ? '#e5e4e0' : '#111008' }}
            onMouseEnter={e=>{ if(product.quantity>0)(e.currentTarget as HTMLButtonElement).style.background='#C9A84C' }}
            onMouseLeave={e=>{ if(product.quantity>0)(e.currentTarget as HTMLButtonElement).style.background='#111008' }}
          >
            {isLoading ? (
              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 text-white" />
            )}
          </button>
        </div>

        {/* Stock */}
        <p className={`text-[10px] font-semibold mt-2 ${stockColor}`}>{stockLabel}</p>
      </div>
    </div>
  )
}