'use client'

import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { ShoppingBag } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  images: any[]
  category: { name: string } | null
  sku: string
}

export function WishlistAddToCart({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem)
  const [loading, setLoading] = useState(false)

  const handleAddToCart = () => {
    if (product.quantity === 0) {
      toast.error('This product is out of stock')
      return
    }

    setLoading(true)
    addItem(product, 1)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setLoading(false), 300)
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleAddToCart}
      loading={loading}
      disabled={product.quantity === 0}
    >
      <ShoppingBag className="h-4 w-4" />
    </Button>
  )
}