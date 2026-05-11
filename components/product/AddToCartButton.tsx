'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  quantity: number
  images?: any[]
  category?: { name: string } | null
  sku?: string
}

interface AddToCartButtonProps {
  product: Product
  className?: string
}

export function AddToCartButton({ product, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (product.quantity === 0) return
    addItem({ ...product, price: Number(product.price), images: product.images || [], category: product.category || null }, qty)
    setAdded(true)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setAdded(false), 2000)
  }

  const outOfStock = product.quantity === 0

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quantity selector */}
      {!outOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</span>
          <div className="flex items-center border border-gray-200">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#C9A84C] transition-colors">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center font-semibold text-sm">{qty}</span>
            <button onClick={() => setQty(q => Math.min(product.quantity, q + 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#C9A84C] transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-xs text-gray-400">{product.quantity} available</span>
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAdd}
        disabled={outOfStock || added}
        className={`w-full flex items-center justify-center gap-3 py-4 font-bold text-sm transition-all duration-300 ${
          outOfStock
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : added
            ? 'bg-green-600 text-white'
            : 'bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008]'
        }`}
      >
        {outOfStock ? (
          'Out of Stock'
        ) : added ? (
          <><Check className="h-4 w-4" />Added to Cart</>
        ) : (
          <><ShoppingCart className="h-4 w-4" />Add to Cart</>
        )}
      </button>
    </div>
  )
}