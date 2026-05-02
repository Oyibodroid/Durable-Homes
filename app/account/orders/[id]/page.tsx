import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, CreditCard, Clock } from 'lucide-react'

export default async function AccountOrderDetailPage({
  params,
}: {
  // ✅ params is a Promise in Next.js 15+
  params: { id: string }
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  // ✅ Await params before accessing properties
  const { id } = params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1, where: { isMain: true } }
            }
          }
        }
      },
      shippingAddress: true,
      billingAddress: true,
      payments: true,
      statusHistory: {
        orderBy: { createdAt: 'asc' }
      },
    },
  })

  if (!order || order.userId !== session.user.id) {
    notFound()
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    ON_HOLD: 'bg-orange-100 text-orange-800',
  }

  const statusIcons = {
    PENDING: Clock,
    PROCESSING: Package,
    SHIPPED: Truck,
    DELIVERED: CheckCircle,
    CANCELLED: Package,
    REFUNDED: Package,
    ON_HOLD: Clock,
  }

  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] ?? Clock

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex-1" />
        <span className={`px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-2 ${statusColors[order.status as keyof typeof statusColors]}`}>
          <StatusIcon className="h-4 w-4" />
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
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
                        <Link
                          href={`/shop/${item.product.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      </div>
                      <p className="font-medium">₦{Number(item.price).toLocaleString()}</p>
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

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((history, index) => {
                const Icon =
                  statusIcons[history.status as keyof typeof statusIcons] ?? Clock

                return (
                  <div key={history.id} className="flex gap-4">
                    <div className="relative">
                      <div className={`h-3 w-3 mt-1.5 rounded-full ${
                        history.status === 'DELIVERED' ? 'bg-green-500' :
                        history.status === 'CANCELLED' ? 'bg-red-500' :
                        'bg-primary'
                      }`} />
                      {index < order.statusHistory.length - 1 && (
                        <div className="absolute top-4 left-1.5 bottom-0 w-0.5 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{history.status}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(history.createdAt).toLocaleString('en-NG')}
                        </p>
                      </div>
                      {history.note && (
                        <p className="text-sm text-gray-600 mt-1 ml-6">
                          {history.note}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                Shipping Address
              </h2>
              <address className="not-italic text-sm">
                <p className="font-medium">
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

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              Payment Information
            </h2>
            <div className="space-y-3">
              {order.payments.map((payment) => (
                <div key={payment.id} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium">{payment.provider}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Reference</span>
                    <span className="font-mono text-xs">{payment.reference}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Need Help? */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions about your order, please contact our support team.
            </p>
            <Link href="/contact">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}