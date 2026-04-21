'use client'

import { useCart, useCartItems, useCartItemCount } from '@/hooks/useCart'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { 
  ShoppingBag, 
  ArrowLeft, 
  Package, 
  Truck, 
  Shield,
  Clock,
  AlertTriangle,
  TrendingUp,
  HardHat,
  Hammer
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const items = useCartItems()
  const itemCount = useCartItemCount()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto border-4 border-gray-200 border-t-yellow-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <HardHat className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h1 className="font-bold text-2xl text-gray-900 mb-2">Loading Your Cart</h1>
            <p className="text-gray-600">Please wait while we prepare your items...</p>
          </div>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border-2 border-gray-200 p-12 text-center">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-200">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Empty
                </div>
              </div>
              
              <h1 className="font-bold text-3xl text-gray-900 mb-3">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Looks like you haven't added any building materials to your cart yet. 
                Browse our catalog of professional-grade products.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <Hammer className="h-6 w-6 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm font-medium">Tools</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <Package className="h-6 w-6 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm font-medium">Materials</p>
                </div>
              </div>

              <Link href="/shop">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                <p className="text-xs text-gray-600">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-gray-500" />
                <p className="text-xs text-gray-600">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Cart with items
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-bold text-3xl text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-yellow-500" />
              Construction Cart
            </h1>
            <div className="bg-gray-900 text-white px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">{itemCount} {itemCount === 1 ? 'Item' : 'Items'}</span>
            </div>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${Math.min((itemCount / 20) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="hidden md:grid grid-cols-12 gap-4 mb-4 px-4 text-sm font-medium text-gray-500">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="bg-white border-2 border-gray-200 divide-y divide-gray-200">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full border-gray-300 hover:border-yellow-500">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <ClearCartButton />
              </div>
            </div>

            {itemCount > 5 && (
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Bulk Order Detected</p>
                    <p className="text-sm text-blue-700">
                      You may qualify for volume discounts. Contact our sales team for a quote.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}

function ClearCartButton() {
  const clearCart = useCart((state) => state.clearCart)
  const items = useCartItems()
  const [showConfirm, setShowConfirm] = useState(false)
  
  if (items.length === 0) return null
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
      >
        Clear Cart
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white max-w-md w-full p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-bold text-lg">Clear Cart</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove all items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  clearCart()
                  setShowConfirm(false)
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}