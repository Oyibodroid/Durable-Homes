'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCartItems, useCartSubtotal, useCart } from '@/hooks/useCart'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Lock, Package, Truck, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@300;400;500;600;700&display=swap');
  .font-display{font-family:'Cormorant Garamond',serif;}
  .hex-bg{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E");}
  .field{width:100%;border:1.5px solid #e5e4e0;padding:11px 14px;font-size:14px;font-family:'Nunito',sans-serif;outline:none;transition:border-color 0.2s;background:white;color:#111;}
  .field:focus{border-color:#C9A84C;}
  .field::placeholder{color:#9ca3af;}
`

type Step = 'billing' | 'payment' | 'confirm'

interface BillingData {
  firstName: string; lastName: string; email: string; phone: string
  address: string; city: string; state: string; country: string
}

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
  'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
  'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
  'FCT Abuja',
]

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const items = useCartItems()
  const subtotal = useCartSubtotal()
  const clearCart = useCart(s => s.clearCart)
  const [step, setStep] = useState<Step>('billing')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState({ shippingFreeThreshold: 100000, shippingBaseRate: 5000, taxRate: 7.5, taxEnabled: true })
  const [billing, setBilling] = useState<BillingData>({
    firstName: '', lastName: '', email: session?.user?.email ?? '', phone: '',
    address: '', city: '', state: '', country: 'Nigeria',
  })

  useEffect(() => {
    setMounted(true)
    fetch('/api/settings/public').then(r => r.json()).then(setSettings).catch(() => {})
    if (session?.user?.email) setBilling(b => ({ ...b, email: session.user!.email! }))
  }, [session])

  useEffect(() => {
    if (mounted && items.length === 0) router.push('/cart')
  }, [mounted, items.length, router])

  if (!mounted || items.length === 0) return null

  const shipping = subtotal >= settings.shippingFreeThreshold ? 0 : settings.shippingBaseRate
  const tax = settings.taxEnabled ? subtotal * (settings.taxRate / 100) : 0
  const total = subtotal + shipping + tax

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

const handlePaystack = async () => {
  setLoading(true)
  try {
    // 1. Create the order
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({ 
          productId: i.product.id, 
          quantity: i.quantity, 
          price: Number(i.product.price) 
        })),
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress: {
          firstName: billing.firstName,
          lastName: billing.lastName,
          email: billing.email,      // ADDED: Zod path ["shippingAddress", "email"]
          phone: billing.phone,
          address: billing.address,    // CHANGED: From 'addressLine1' to 'address' to match Zod path ["shippingAddress", "address"]
          city: billing.city,
          state: billing.state,
          country: billing.country,
        },
        paymentMethod: 'paystack', 
        guestEmail: session ? undefined : billing.email,
      }),
    })

    const data = await orderRes.json()

    if (!orderRes.ok) {
      // Log the specific Zod issues if they exist
      console.error('Order Creation Error:', data.issues)
      throw new Error(data.message || 'Order creation failed')
    }

    const { orderId } = data

    // 2. Initialize payment
    const payRes = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        orderId, 
        email: billing.email, 
        amount: total 
      }),
    })
    
    const { authorization_url } = await payRes.json()
    if (!authorization_url) throw new Error('Payment initialization failed')

    // Redirect to Paystack
    window.location.href = authorization_url
  } catch (err: any) {
    console.error('Checkout Error:', err)
    toast.error(err.message || 'Something went wrong. Please try again.')
    setLoading(false)
  }
}

  const STEPS: { key: Step; label: string; icon: typeof Lock }[] = [
    { key: 'billing', label: 'Billing', icon: Package },
    { key: 'payment', label: 'Payment', icon: CreditCard },
  ]

  return (
    <>
      <style>{STYLES}</style>
      <div className="min-h-screen bg-[#faf9f6]" style={{ fontFamily:"'Nunito',sans-serif", paddingTop:'80px' }}>

        {/* Header */}
        <div className="bg-[#111008] hex-bg py-10">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <Link href="/cart" className="hover:text-[#C9A84C] transition-colors">Cart</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#C9A84C]">Checkout</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-px bg-[#C9A84C]" />
                  <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Secure Checkout</span>
                </div>
                <h1 className="font-display text-4xl text-white font-medium">Complete Your Order</h1>
              </div>
              <Lock className="h-5 w-5 text-gray-600 hidden sm:block" />
            </div>

            {/* Steps */}
            <div className="flex items-center gap-3 mt-6">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 text-xs font-semibold ${step === s.key ? 'text-[#C9A84C]' : (STEPS.indexOf({ key: step } as any) > i ? 'text-green-400' : 'text-gray-600')}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step === s.key ? 'bg-[#C9A84C] text-[#111008]' : 'bg-white/10 text-gray-500'}`}>
                      {i + 1}
                    </div>
                    {s.label}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-8 h-px bg-white/10" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left — form */}
            <div className="lg:col-span-2">

              {/* Billing */}
              {step === 'billing' && (
                <div className="bg-white border border-gray-100 p-7">
                  <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#C9A84C]" />Billing & Delivery Details
                  </h2>
                  <form onSubmit={handleBillingSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id:'firstName', label:'First Name', placeholder:'John' },
                        { id:'lastName', label:'Last Name', placeholder:'Doe' },
                      ].map(({ id, label, placeholder }) => (
                        <div key={id}>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label} *</label>
                          <input className="field" placeholder={placeholder} required
                            value={(billing as any)[id]} onChange={e => setBilling(b => ({ ...b, [id]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email *</label>
                        <input className="field" type="email" placeholder="you@example.com" required
                          value={billing.email} onChange={e => setBilling(b => ({ ...b, email: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone *</label>
                        <input className="field" type="tel" placeholder="+234 000 000 0000" required
                          value={billing.phone} onChange={e => setBilling(b => ({ ...b, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address *</label>
                      <input className="field" placeholder="Street address" required
                        value={billing.address} onChange={e => setBilling(b => ({ ...b, address: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City *</label>
                        <input className="field" placeholder="Lagos" required
                          value={billing.city} onChange={e => setBilling(b => ({ ...b, city: e.target.value }))} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State *</label>
                        <select className="field" required value={billing.state} onChange={e => setBilling(b => ({ ...b, state: e.target.value }))}>
                          <option value="">Select state</option>
                          {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="submit"
                      className="w-full bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008] font-bold py-4 transition-all duration-300 flex items-center justify-center gap-3 mt-2">
                      Continue to Payment <ChevronRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Payment */}
              {step === 'payment' && (
                <div className="space-y-4">
                  <button onClick={() => setStep('billing')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#C9A84C] transition-colors mb-2">
                    <ArrowLeft className="h-4 w-4" />Edit billing details
                  </button>

                  {/* Billing summary */}
                  <div className="bg-white border border-gray-100 p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Delivering to</p>
                    <p className="text-sm font-semibold text-gray-900">{billing.firstName} {billing.lastName}</p>
                    <p className="text-sm text-gray-500">{billing.address}, {billing.city}, {billing.state}</p>
                    <p className="text-sm text-gray-500">{billing.phone}</p>
                  </div>

                  {/* Payment method */}
                  <div className="bg-white border border-gray-100 p-7">
                    <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#C9A84C]" />Payment Method
                    </h2>

                    {/* Paystack option */}
                    <div className="border-2 border-[#C9A84C] p-5 bg-[#C9A84C]/3 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[#C9A84C] flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">Pay with Paystack</p>
                          <p className="text-xs text-gray-500">Card, bank transfer, USSD & more</p>
                        </div>
                        <div className="ml-auto flex gap-2">
                          {['VISA', 'MC', 'GT'].map(b => (
                            <span key={b} className="text-[9px] font-black border border-gray-200 px-1.5 py-0.5 text-gray-500">{b}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                      <Lock className="h-3.5 w-3.5" />
                      Your payment is encrypted and secure. We never store card details.
                    </div>

                    <button onClick={handlePaystack} disabled={loading}
                      className="w-full bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold py-4 transition-colors flex items-center justify-center gap-3 disabled:opacity-60">
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-[#111008]/30 border-t-[#111008] rounded-full animate-spin" />Processing...</>
                      ) : (
                        <>Pay ₦{total.toLocaleString(undefined, { minimumFractionDigits: 0 })} <Lock className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right — order summary */}
            <div>
              <div className="bg-white border border-gray-100 sticky top-24">
                <div className="bg-[#111008] px-5 py-4">
                  <p className="text-white font-semibold text-sm flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#C9A84C]" />Order Summary
                  </p>
                </div>
                <div className="p-5">
                  {/* Items */}
                  <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                    {items.map(item => {
                      const img = item.product.images?.[0]?.url ?? (typeof item.product.images?.[0] === 'string' ? item.product.images[0] : null)
                      return (
                        <div key={item.product.id} className="flex gap-3 items-center">
                          <div className="w-12 h-12 bg-[#faf9f6] border border-gray-100 flex-shrink-0 overflow-hidden relative">
                            {img ? <Image src={img} alt={item.product.name} fill className="object-cover" /> : <Package className="h-5 w-5 text-gray-300 m-auto" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-xs font-bold text-gray-900 flex-shrink-0">
                            ₦{(Number(item.product.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `₦${shipping.toLocaleString()}`}</span>
                    </div>
                    {settings.taxEnabled && (
                      <div className="flex justify-between text-gray-600">
                        <span>VAT ({settings.taxRate}%)</span>
                        <span>₦{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 text-base pt-3 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-[#C9A84C]">₦{total.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-gray-400 mt-3">
                      Add ₦{(settings.shippingFreeThreshold - subtotal).toLocaleString()} more for free shipping
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-4 text-gray-400">
                    <Truck className="h-4 w-4" />
                    <span className="text-xs">Nationwide delivery</span>
                    <Lock className="h-4 w-4" />
                    <span className="text-xs">Secure payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}