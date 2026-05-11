import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Printer, Mail, Clock, CreditCard, User } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { PrintButton } from '@/components/admin/PrintButton'
import { OrderStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

async function updateOrderStatus(formData: FormData) {
  'use server'
  const orderId = formData.get('orderId') as string
  const status = formData.get('status') as OrderStatus 

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            note: `Status updated to ${status}`,
          },
        },
      },
    })
    revalidatePath(`/admin/orders/${orderId}`)
  } catch (error) {
    console.error('Failed to update order status:', error)
  }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: { images: { take: 1, where: { isMain: true } } },
          },
        },
      },
      shippingAddress: true,
      billingAddress: true,
      discount: true,
      payments: { orderBy: { createdAt: 'desc' } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!order) notFound()

  const statusColors = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
    SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    REFUNDED: 'bg-slate-100 text-slate-700 border-slate-200',
    ON_HOLD: 'bg-orange-50 text-orange-700 border-orange-200',
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon" className="rounded-full hover:bg-[#C9A84C] hover:text-white border-gray-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-[#111008]">Order {order.orderNumber}</h1>
              <span className={cn(
                "px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                statusColors[order.status as keyof typeof statusColors]
              )}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PrintButton />
          <Button className="bg-[#111008] hover:bg-[#C9A84C] transition-colors text-white gap-2">
            <Mail className="h-4 w-4" />
            Notify Customer
          </Button>
        </div>
      </div>

      {/* Standard Invoice Header - Only Visible on Print */}
      <div className="hidden print:block mb-10 border-b pb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-display font-bold text-black uppercase tracking-tighter">Invoice</h1>
            <p className="text-gray-500 mt-2">Order ID: {order.orderNumber}</p>
            <p className="text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold">Durable Homes</h2>
            <p className="text-sm text-gray-500">Lagos, Nigeria</p>
            <p className="text-sm text-gray-500">support@durablehomes.ng</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Update Form - Hidden on Print */}
          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm print:hidden">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Update Logistics
            </h2>
            <form action={updateOrderStatus} className="flex gap-4">
              <input type="hidden" name="orderId" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#C9A84C] outline-none transition-all"
              >
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button type="submit" className="bg-[#C9A84C] hover:bg-[#111008] text-white">Update</Button>
            </form>
          </section>

          {/* Items Table */}
          <section className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold font-display text-[#111008]">Inventory Details</h2>
              <span className="text-xs font-medium text-gray-400">{order.items.length} Items</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex gap-6 items-center">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 print:hidden">
                    {item.product.images[0] && (
                      <Image src={item.product.images[0].url} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#111008] truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">{item.quantity} × ₦{Number(item.price).toLocaleString()}</p>
                    <p className="font-bold text-[#111008]">₦{Number(item.total).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Financial Summary */}
            <div className="bg-gray-50/50 p-8">
              <div className="max-w-xs ml-auto space-y-3">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-[#111008]">₦{Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping Fee</span>
                  <span className="text-[#111008]">₦{Number(order.shippingTotal).toLocaleString()}</span>
                </div>
                {Number(order.discountTotal) > 0 && (
                  <div className="flex justify-between text-sm font-bold text-emerald-600">
                    <span>Discount Applied</span>
                    <span>-₦{Number(order.discountTotal).toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Grand Total</span>
                  <span className="text-2xl font-display font-bold text-[#C9A84C]">₦{Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <section className="bg-[#111008] text-white rounded-xl p-6 shadow-xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A84C] mb-4 flex items-center gap-2">
              <User className="h-4 w-4" /> Client Profile
            </h2>
            {order.user ? (
              <div className="space-y-1">
                <p className="font-display text-lg font-semibold">{order.user.name}</p>
                <p className="text-sm text-gray-400 break-all">{order.user.email}</p>
                <Link href={`/admin/users/${order.user.id}`} className="block mt-4 print:hidden">
                  <Button variant="outline" size="sm" className="w-full border-white/10 bg-white/5 hover:bg-[#C9A84C] hover:text-white">Profile Details</Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="font-semibold">{order.guestEmail}</p>
                <p className="text-xs text-gray-400 uppercase mt-1">Guest Checkout</p>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <Truck className="h-4 w-4" /> Shipping Route
            </h2>
            <address className="not-italic text-sm text-[#111008] leading-relaxed">
              <p className="font-bold">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p className="text-gray-400 mt-2">{order.shippingAddress?.phone}</p>
            </address>
          </section>

          <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Transaction
            </h2>
            {order.payments.map((payment) => (
              <div key={payment.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">{payment.status}</span>
                  <span className="text-sm font-bold text-[#111008]">{payment.provider}</span>
                </div>
                <p className="text-[10px] font-mono text-gray-400 break-all">REF: {payment.reference}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
      
      {/* Print Footer - Invoice only */}
      <div className="hidden print:block mt-20 text-center border-t pt-8">
        <p className="text-sm font-bold">Thank you for choosing Durable Homes.</p>
        <p className="text-xs text-gray-400 mt-1">This is a computer-generated invoice. No signature required.</p>
      </div>
    </div>
  )
}