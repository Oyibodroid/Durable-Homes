'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  createdAt: string
  items: OrderItem[]
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const token = searchParams.get('token')
  const clearCart = useCart((state) => state.clearCart)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    clearCart()

    if (!orderId) {
      router.replace('/')
      return
    }

    fetchOrder()
  }, [orderId])

  async function fetchOrder() {
    try {
      // ✅ Pass the signed token in the URL so the API can verify it
      const url = token
        ? `/api/orders/${orderId}?token=${token}`
        : `/api/orders/${orderId}`

      const res = await fetch(url)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Order not found')
      setOrder(data)
    } catch (err) {
      console.error('fetchOrder error:', err)
      setError('We could not load your order details.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your order...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border-2 border-gray-200 p-10 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Received
          </h1>
          <p className="text-gray-600 mb-6">
            Your payment was successful but we couldn't load your order details.
            Check your email for confirmation or visit your orders page.
          </p>
          <Link href="/account/orders">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              View My Orders
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">

        {/* Success header */}
        <div className="bg-white border-2 border-gray-200 p-10 text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-bold text-3xl text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-1">
            Thank you for your purchase. Your payment was successful.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to you.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg">
            <Package className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">
              Order #{order.orderNumber}
            </span>
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white border-2 border-gray-200 mb-6">
          <div className="bg-gray-900 text-white px-6 py-4">
            <h2 className="font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-yellow-500" />
              Order Summary
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ₦{(Number(item.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-200 px-6 py-4 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total Paid</span>
            <span className="text-xl font-bold text-yellow-600">
              ₦{Number(order.total).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white border-2 border-gray-200 px-6 py-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Payment confirmed</p>
                <p className="text-xs text-gray-500">Your payment has been received and verified.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Order processing</p>
                <p className="text-xs text-gray-500">We're preparing your items for dispatch.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Truck className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Out for delivery</p>
                <p className="text-xs text-gray-400">You'll get a notification when your order ships.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/account/orders/${order.id}`} className="flex-1">
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
              <Package className="h-4 w-4 mr-2" />
              Track My Order
            </Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button variant="outline" className="w-full border-gray-300 hover:border-yellow-500">
              <Home className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}