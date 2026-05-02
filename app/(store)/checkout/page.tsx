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
      // FIX: Added optional chaining and fallbacks to prevent "item.product is undefined" crashes
      const formattedItems = items.map(item => {
        const product = item.product || item; // Fallback if product is flattened
        return {
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        }
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: formattedItems,
          subtotal,
          tax,
          shipping,
          total,
          shippingAddress: data,
          billingAddress: data,
          // Defaulting to paystack, can be changed in the payment step
          paymentMethod: 'paystack', 
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order')
      }

      setBillingData(data)
      setOrderId(result.id)
      setCurrentStep('payment')
    } catch (error: any) {
      console.error("Order Creation Error:", error)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async (method: string) => {
    if (!orderId) {
      toast.error("Order session expired. Please refresh.");
      return;
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          method, // 'paystack' or 'flutterwave'
          email: billingData.email,
          amount: total,
        }),
      })

      const payment = await response.json()

      if (!response.ok) {
        throw new Error(payment.error || 'Payment initialization failed')
      }

      // Logic for Gateways that redirect (Paystack/Flutterwave)
      if (payment.authorization_url || payment.data?.link) {
        const redirectUrl = payment.authorization_url || payment.data?.link;
        window.location.href = redirectUrl;
      } else {
        // If it's a direct success or manual method
        setCurrentStep('confirmation')
        clearCart()
      }
    } catch (error: any) {
      console.error("Payment Error:", error)
      toast.error(error.message || 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Progress steps array
  const steps = [
    { id: 'billing', name: 'Billing' },
    { id: 'payment', name: 'Payment' },
    { id: 'confirmation', name: 'Done' },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C]" />
      </div>
    )
  }

  if (items.length === 0 && currentStep !== 'confirmation') return null

  return (
    <div className="container max-w-6xl py-12 px-6 lg:px-12">
      {/* Visual Progress Bar */}
      <div className="mb-12 flex justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            const isActive = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${isActive ? 'border-[#C9A84C] bg-[#C9A84C] text-white' : 
                    isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 text-gray-400'}`}>
                  {isCompleted ? <CheckCircle className="h-6 w-6" /> : <span>{index + 1}</span>}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {currentStep === 'billing' && (
            <div className="bg-white border border-gray-100 p-8 shadow-sm">
              <h2 className="font-display text-2xl mb-6">Billing Information</h2>
              <BillingForm onSubmit={handleBillingSubmit} isSubmitting={isProcessing} />
            </div>
          )}

          {currentStep === 'payment' && (
            <div className="bg-white border border-gray-100 p-8 shadow-sm">
              <h2 className="font-display text-2xl mb-6">Select Payment Method</h2>
              <PaymentMethods
                onPayment={handlePayment}
                isProcessing={isProcessing}
                amount={total}
              />
            </div>
          )}

          {currentStep === 'confirmation' && (
            <div className="bg-white border border-gray-100 p-12 text-center shadow-sm">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="font-display text-3xl mb-4">Order Confirmed!</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Thank you for choosing Durable Homes. We've received your order and will begin processing it immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shop">
                  <Button variant="outline" className="w-full sm:w-auto">Continue Shopping</Button>
                </Link>
                {orderId && (
                  <Link href={`/account/orders/${orderId}`}>
                    <Button className="w-full sm:w-auto bg-[#111008]">Track Order</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}