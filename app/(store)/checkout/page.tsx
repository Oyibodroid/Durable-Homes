'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, useCartItems, useCartSubtotal } from '@/hooks/useCart'
import { useSession } from 'next-auth/react'
import { BillingForm } from '@/components/checkout/BillingForm'
import { PaymentMethods } from '@/components/checkout/PaymentMethods'
import { CartSummary } from '@/components/cart/CartSummary'
import { toast } from '@/components/ui/Toast'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

type Step = 'billing' | 'payment' | 'confirmation'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const items = useCartItems()
  const subtotal = useCartSubtotal()
  const clearCart = useCart((state) => state.clearCart)
  const [currentStep, setCurrentStep] = useState<Step>('billing')
  const [isProcessing, setIsProcessing] = useState(false)
  const [billingData, setBillingData] = useState<any>(null)
  const [orderId, setOrderId] = useState<string>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Redirect in useEffect — never call router.push() during render
  useEffect(() => {
    if (mounted && items.length === 0 && currentStep !== 'confirmation') {
      router.push('/cart')
    }
  }, [mounted, items.length, currentStep, router])

  const tax = subtotal * 0.075
  const shipping = subtotal > 100000 ? 0 : 5000
  const total = subtotal + tax + shipping

  const handleBillingSubmit = async (data: any) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          subtotal,
          tax,
          shipping,
          total,
          shippingAddress: data,
          billingAddress: data,
          paymentMethod: 'paystack',
        }),
      })

      const order = await response.json()

      if (!response.ok) {
        throw new Error(order.error || 'Failed to create order')
      }

      setBillingData(data)
      setOrderId(order.id)
      setCurrentStep('payment')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async (method: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          method,
          email: billingData.email,
          amount: total,
        }),
      })

      const payment = await response.json()

      if (!response.ok) {
        throw new Error(payment.error || 'Payment initialization failed')
      }

      if (payment.authorization_url) {
        window.location.href = payment.authorization_url
      } else {
        setCurrentStep('confirmation')
        clearCart()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const steps = [
    { id: 'billing', name: 'Billing Information' },
    { id: 'payment', name: 'Payment' },
    { id: 'confirmation', name: 'Confirmation' },
  ]

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  // Render nothing while the useEffect redirect is in flight
  if (items.length === 0 && currentStep !== 'confirmation') {
    return null
  }

  return (
    <div className="container py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-medium
                  ${currentStep === step.id
                    ? 'bg-primary text-white'
                    : steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {steps.findIndex(s => s.id === currentStep) > index ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-2
                  ${steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                  }
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === 'billing' && (
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Billing Information</h2>
              <BillingForm
                onSubmit={handleBillingSubmit}
                isSubmitting={isProcessing}
              />
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
              <PaymentMethods
                onPayment={handlePayment}
                isProcessing={isProcessing}
                amount={total}
              />
            </div>
          )}

          {currentStep === 'confirmation' && (
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. We'll send you an email with your order details.
              </p>
              <div className="space-x-4">
                <Link href="/shop">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
                <Link href={`/account/orders/${orderId}`}>
                  <Button>View Order</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}