'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CartItem as CartItemType } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Trash2, Package, AlertCircle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const [imageError, setImageError] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value)
    if (quantity > 0 && quantity <= (item.product.quantity || 10)) {
      updateQuantity(item.product.id, quantity)
    }
  }

  const getProductImage = () => {
    if (imageError) return '/images/industrial-placeholder.jpg'

    const images = item.product.images
    if (images && Array.isArray(images) && images.length > 0) {
      const firstImage = images[0]
      const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
        return imageUrl
      }
    }
    
    return '/images/industrial-placeholder.jpg'
  }

  const productImage = getProductImage()
  const categoryName = item.product.category?.name || 'Building Material'
  const maxQuantity = item.product.quantity || 10
  const isLowStock = maxQuantity < 5

  return (
    <>
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 py-6 px-4 hover:bg-gray-50 transition-colors">
        {/* Product Image & Name - Colspan 6 */}
        <div className="md:col-span-6 flex gap-4">
          {/* Image */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden border-2 border-gray-200 bg-gray-100">
            <Link href={`/shop/${item.product.slug}`}>
              <Image
                src={productImage}
                alt={item.product.name}
                fill
                sizes="96px"
                className="object-cover object-center"
                onError={() => setImageError(true)}
              />
            </Link>
            {/* Stock Indicator */}
            {isLowStock && (
              <div className="absolute top-1 left-1">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <Link href={`/shop/${item.product.slug}`}>
              <h3 className="font-bold text-gray-900 hover:text-yellow-600 transition-colors line-clamp-2">
                {item.product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1">{categoryName}</p>
            <p className="text-xs text-gray-400 mt-1">SKU: {item.product.sku || 'N/A'}</p>
            
            {/* Mobile Price (visible only on mobile) */}
            <div className="md:hidden mt-2">
              <span className="font-bold text-gray-900">
                ₦{(item.product.price * item.quantity).toLocaleString()}
              </span>
              {isLowStock && (
                <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Only {maxQuantity} left
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Price - Colspan 2 (Desktop only) */}
        <div className="hidden md:block md:col-span-2 text-center">
          <span className="font-medium text-gray-900">
            ₦{item.product.price.toLocaleString()}
          </span>
          {item.product.compareAtPrice && (
            <p className="text-xs text-gray-500 line-through">
              ₦{item.product.compareAtPrice.toLocaleString()}
            </p>
          )}
        </div>

        {/* Quantity - Colspan 2 */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-center gap-2">
            <Input
              type="number"
              min="1"
              max={maxQuantity}
              value={item.quantity}
              onChange={handleQuantityChange}
              className="w-20 h-10 text-center"
            />
            <span className="text-xs text-gray-500">
              / {maxQuantity}
            </span>
          </div>
          {isLowStock && (
            <p className="text-xs text-yellow-600 text-center mt-1 hidden md:block">
              Low stock
            </p>
          )}
        </div>

        {/* Total - Colspan 2 */}
        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
          <span className="font-bold text-gray-900 md:hidden">Total:</span>
          <span className="font-bold text-lg text-gray-900">
            ₦{(item.product.price * item.quantity).toLocaleString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white max-w-md w-full p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="font-bold text-lg">Remove Item</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove <span className="font-bold">"{item.product.name}"</span> from your cart?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  removeItem(item.product.id)
                  setShowDeleteConfirm(false)
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Remove Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}