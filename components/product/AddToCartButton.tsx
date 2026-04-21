'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { ShoppingBag } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface ProductProp {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  sku: string
  quantity: number
  images: any[]
  category?: { name: string } | null
}

interface AddToCartButtonProps {
  product: ProductProp
  quantity?: number
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export function AddToCartButton({ 
  product, 
  quantity = 1, 
  variant = 'default',
  className 
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addItem, itemCount } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    
    try {
      // Ensure price is a number
      const productToAdd = {
        ...product,
        price: Number(product.price),
      }
      
      addItem(productToAdd, quantity)
      toast.success(`${product.name} added to cart!`)
      
      // Log for debugging
      console.log('Cart updated. New count:', itemCount + quantity)
    } catch (error) {
      toast.error('Failed to add item to cart')
      console.error('Add to cart error:', error)
    } finally {
      // Small delay to show loading state
      setTimeout(() => setIsLoading(false), 300)
    }
  }

  const isOutOfStock = product.quantity === 0

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isLoading}
      loading={isLoading}
      variant={variant}
      className={className}
    >
      <ShoppingBag className="mr-2 h-4 w-4" />
      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  )
}