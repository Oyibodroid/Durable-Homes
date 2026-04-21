'use client'

import { useCartItems, useCartItemCount, useCartSubtotal } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Package, Truck, Shield, CreditCard, Loader2 } from 'lucide-react'

interface PublicSettings {
  shippingFreeThreshold: number
  shippingBaseRate: number
  taxRate: number
  taxEnabled: boolean
}

const DEFAULT_SETTINGS: PublicSettings = {
  shippingFreeThreshold: 100000,
  shippingBaseRate: 5000,
  taxRate: 7.5,
  taxEnabled: true,
}

export function CartSummary() {
  const router = useRouter()
  const items = useCartItems()
  const itemCount = useCartItemCount()
  const subtotal = useCartSubtotal()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setIsMounted(true)
    fetch('/api/settings/public')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {}) // fall back to defaults silently
  }, [])

  const handleCheckout = () => {
    setIsCheckingOut(true)
    router.push('/checkout')
  }

  if (!isMounted) {
    return (
      <div className="bg-white border-2 border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  const shipping = subtotal >= settings.shippingFreeThreshold ? 0 : settings.shippingBaseRate
  const tax = settings.taxEnabled ? subtotal * (settings.taxRate / 100) : 0
  const total = subtotal + shipping + tax

  return (
    <div className="bg-white border-2 border-gray-200 sticky top-24">
      <div className="bg-gray-900 text-white p-4">
        <h3 className="font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-yellow-500" />
          Order Summary
        </h3>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <span className="text-gray-600">Total Items</span>
          <span className="font-bold text-lg">{itemCount}</span>
        </div>

        <div className="space-y-3 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? (
                <span className="text-green-600 font-bold">FREE</span>
              ) : (
                `₦${shipping.toLocaleString()}`
              )}
            </span>
          </div>
          {settings.taxEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({settings.taxRate}% VAT)</span>
              <span className="font-medium">
                ₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {subtotal < settings.shippingFreeThreshold && shipping > 0 && (
            <p className="text-xs text-gray-500">
              Add ₦{(settings.shippingFreeThreshold - subtotal).toLocaleString()} more for free shipping
            </p>
          )}
        </div>

        <div className="bg-gray-50 p-4 -mx-6 mb-4 border-y border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-yellow-600">
              ₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 text-lg"
          size="lg"
          loading={isCheckingOut}
        >
          Proceed to Checkout
        </Button>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <Shield className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-600">Secure</p>
            </div>
            <div>
              <CreditCard className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-600">Payment</p>
            </div>
            <div>
              <Truck className="h-4 w-4 mx-auto mb-1 text-gray-500" />
              <p className="text-xs text-gray-600">Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}