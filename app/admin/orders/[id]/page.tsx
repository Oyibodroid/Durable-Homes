import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Printer, Mail } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { PrintButton } from '@/components/admin/PrintButton'

async function updateOrderStatus(formData: FormData) {
  'use server'

  const orderId = formData.get('orderId') as string
  const status = formData.get('status') as string

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

export default async function OrderDetailPage({
  params,
}: {
  // ✅ params is a Promise in Next.js 15+
  params: { id: string }
}) {
  // ✅ Await params before accessing properties
  const { id } = params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: {
              images: { take: 1, where: { isMain: true } },
            },
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

  if (!order) {
    notFound()
  }

  const statusColors = {
    PENDING:    'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED:    'bg-purple-100 text-purple-800',
    DELIVERED:  'bg-green-100 text-green-800',
    CANCELLED:  'bg-red-100 text-red-800',
    REFUNDED:   'bg-gray-100 text-gray-800',
    ON_HOLD:    'bg-orange-100 text-orange-800',
  }

  const statusIcons = {
    PENDING:    Package,
    PROCESSING: Package,
    SHIPPED:    Truck,
    DELIVERED:  CheckCircle,
    CANCELLED:  XCircle,
    REFUNDED:   XCircle,
    ON_HOLD:    Package,
  }

  const StatusIcon =
    statusIcons[order.status as keyof typeof statusIcons] ?? Package

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
        {/* <div className="flex-1" /> */}
        <PrintButton/>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Order Status</h2>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${
                  statusColors[order.status as keyof typeof statusColors]
                }`}
              >
                <StatusIcon className="h-4 w-4" />
                {order.status}
              </div>
            </div>

            <form action={updateOrderStatus} className="flex gap-4">
              <input type="hidden" name="orderId" value={order.id} />
              <select
                name="status"
                defaultValue={order.status}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <Button type="submit">Update Status</Button>
            </form>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      {/* ✅ Decimal → Number */}
                      <p className="font-medium">
                        ₦{Number(item.price).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="font-medium">
                        Total: ₦{Number(item.total).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t">
              <dl className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd>₦{Number(order.subtotal).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Shipping</dt>
                  <dd>₦{Number(order.shippingTotal).toLocaleString()}</dd>
                </div>
                {Number(order.discountTotal) > 0 && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Discount</dt>
                    <dd className="text-green-600">
                      -₦{Number(order.discountTotal).toLocaleString()}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Tax</dt>
                  <dd>₦{Number(order.taxTotal).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <dt>Total</dt>
                  <dd>₦{Number(order.total).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Status History</h2>
            <div className="space-y-4">
              {order.statusHistory.map((history, index) => (
                <div key={history.id} className="flex gap-4">
                  <div className="relative">
                    <div className="h-3 w-3 mt-1.5 rounded-full bg-primary" />
                    {index < order.statusHistory.length - 1 && (
                      <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between">
                      <p className="font-medium">{history.status}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(history.createdAt).toLocaleString('en-NG')}
                      </p>
                    </div>
                    {history.note && (
                      <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                    )}
                    {history.changedBy && (
                      <p className="text-xs text-gray-500 mt-1">
                        By: {history.changedBy}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            {order.user ? (
              <div>
                <p className="font-medium">{order.user.name}</p>
                <p className="text-sm text-gray-600">{order.user.email}</p>
                {order.user.phone && (
                  <p className="text-sm text-gray-600">{order.user.phone}</p>
                )}
                <div className="mt-4">
                  <Link href={`/admin/users/${order.user.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Customer Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-medium">Guest Customer</p>
                <p className="text-sm text-gray-600">{order.guestEmail}</p>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <address className="not-italic text-sm">
                <p>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p>{order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                )}
              </address>
            </div>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
              <address className="not-italic text-sm">
                <p>
                  {order.billingAddress.firstName} {order.billingAddress.lastName}
                </p>
                <p>{order.billingAddress.addressLine1}</p>
                {order.billingAddress.addressLine2 && (
                  <p>{order.billingAddress.addressLine2}</p>
                )}
                <p>
                  {order.billingAddress.city}, {order.billingAddress.state}
                </p>
                <p>{order.billingAddress.postalCode}</p>
                <p>{order.billingAddress.country}</p>
                {order.billingAddress.phone && (
                  <p className="mt-2">Phone: {order.billingAddress.phone}</p>
                )}
              </address>
            </div>
          )}

          {/* Payment Information */}
          {order.payments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              {order.payments.map((payment) => (
                <div key={payment.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Provider</span>
                    <span className="font-medium">{payment.provider}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount</span>
                    {/* ✅ Decimal → Number */}
                    <span className="font-medium">
                      ₦{Number(payment.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reference</span>
                    <span className="font-mono text-xs">{payment.reference}</span>
                  </div>
                  {payment.transactionId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono text-xs">{payment.transactionId}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Email Customer
              </Button>
              <PrintButton/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}