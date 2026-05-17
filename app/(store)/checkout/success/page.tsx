'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  CheckCircle,
  Package,
  Home,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

// --- Interfaces ---
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

// --- Main Page Component ---
export default function CheckoutSuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  )
}

// --- Content Component ---
function SuccessPageContent() {
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
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-sm font-medium text-neutral-600">Loading your order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Payment Confirmed</h1>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            Your transaction processed successfully, but we encountered a brief delay assembling your summary overview details.
          </p>
          <Link href="/account/orders" className="block">
            <Button className="w-full bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm">
              View Order History
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-xl">
        
        {/* Main Status Hero Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-8 text-center mb-6 transition-all">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="font-bold text-2xl md:text-3xl text-neutral-900 tracking-tight mb-2">
            Order Confirmed
          </h1>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed mb-6">
            Thank you for your purchase! Your invoice context has been recorded and finalized.
          </p>
          
          <div className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200/60 text-neutral-800 px-4 py-2 rounded-xl">
            <Package className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold tracking-wider font-mono text-neutral-950">
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* Modular Summary Block */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden mb-8">
          <div className="border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
            <h2 className="font-semibold text-sm text-neutral-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-neutral-500" /> Order Summary
            </h2>
          </div>
          
          <div className="divide-y divide-neutral-100 px-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-neutral-50/30">
                <div className="space-y-0.5">
                  <p className="font-medium text-neutral-900 text-sm tracking-tight">{item.name}</p>
                  <p className="text-xs text-neutral-400 font-medium">Quantity: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-neutral-900 font-mono">
                  ₦{(Number(item.price) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-neutral-200/80 bg-neutral-50/30 px-6 py-5 flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-600">Total Settled</span>
            <span className="text-lg font-bold text-neutral-950 font-mono tracking-tight">
              ₦{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Primary Functional Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/account/orders/${order.id}`} className="flex-1">
            <Button className="w-full bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl transition-all shadow-sm group">
              <Package className="h-4 w-4 mr-2" /> Track My Order
              <ArrowRight className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
            </Button>
          </Link>
          <Link href="/shop" className="flex-1">
            <Button variant="outline" className="w-full border-neutral-200 bg-white hover:bg-neutral-50 hover:text-neutral-900 text-neutral-700 rounded-xl transition-all">
              <Home className="h-4 w-4 mr-2" /> Continue Shopping
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}