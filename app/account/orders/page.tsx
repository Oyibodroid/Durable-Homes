import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Package,
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  PauseCircle,
} from 'lucide-react'

// Map order status to Badge variant and icon
const statusConfig: Record<
  string,
  {
    variant: 'success' | 'warning' | 'default' | 'secondary' | 'destructive' | 'outline'
    icon: React.ElementType
    label: string
  }
> = {
  PENDING:    { variant: 'warning',     icon: Clock,        label: 'Pending' },
  PROCESSING: { variant: 'default',     icon: Package,      label: 'Processing' },
  SHIPPED:    { variant: 'secondary',   icon: Truck,        label: 'Shipped' },
  DELIVERED:  { variant: 'success',     icon: CheckCircle,  label: 'Delivered' },
  CANCELLED:  { variant: 'destructive', icon: XCircle,      label: 'Cancelled' },
  REFUNDED:   { variant: 'outline',     icon: RotateCcw,    label: 'Refunded' },
  ON_HOLD:    { variant: 'warning',     icon: PauseCircle,  label: 'On Hold' },
}

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  const { page: pageParam, status: statusParam } = await searchParams
  const page = Number(pageParam) || 1
  const limit = 10
  const skip = (page - 1) * limit

  const where: any = { userId: session.user.id }
  if (statusParam) where.status = statusParam

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          take: 3,
          include: {
            product: {
              include: {
                images: { take: 1, where: { isMain: true } },
              },
            },
          },
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  const statuses = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-600">
            {total} order{total !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link href="/account/orders">
          <Button
            variant={!statusParam ? 'default' : 'outline'}
            size="sm"
          >
            All
          </Button>
        </Link>
        {statuses.map((s) => {
          const config = statusConfig[s]
          const Icon = config.icon
          return (
            <Link key={s} href={`/account/orders?status=${s}`}>
              <Button
                variant={statusParam === s ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
              </Button>
            </Link>
          )
        })}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <ShoppingBag className="h-14 w-14 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {statusParam ? `No ${statusConfig[statusParam]?.label ?? statusParam} orders` : 'No orders yet'}
            </h2>
            <p className="text-gray-500 mb-6">
              {statusParam
                ? 'Try a different status filter above.'
                : "You haven't placed any orders yet."}
            </p>
            <Link href="/shop">
              <Button>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] ?? statusConfig.PENDING
            const StatusIcon = config.icon

            return (
              <Link key={order.id} href={`/account/orders/${order.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Order meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-gray-900">
                            {order.orderNumber}
                          </p>
                          <Badge variant={config.variant} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {new Date(order.createdAt).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {' · '}
                          {order._count.items} item{order._count.items !== 1 ? 's' : ''}
                        </p>

                        {/* Product image previews */}
                        <div className="flex gap-2">
                          {order.items.map((item) => {
                            const img = item.product.images[0]
                            return (
                              <div
                                key={item.id}
                                className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200"
                              >
                                {img ? (
                                  <img
                                    src={img.url}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          {order._count.items > 3 && (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-500 font-medium">
                                +{order._count.items - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price and arrow */}
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <p className="text-lg font-bold text-gray-900">
                          ₦{Number(order.total).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/account/orders?page=${page - 1}${statusParam ? `&status=${statusParam}` : ''}`}
            >
              <Button variant="outline" size="sm">Previous</Button>
            </Link>
          )}

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/account/orders?page=${p}${statusParam ? `&status=${statusParam}` : ''}`}
              >
                <Button
                  variant={p === page ? 'default' : 'outline'}
                  size="sm"
                  className="w-9"
                >
                  {p}
                </Button>
              </Link>
            ))}
          </div>

          {page < totalPages && (
            <Link
              href={`/account/orders?page=${page + 1}${statusParam ? `&status=${statusParam}` : ''}`}
            >
              <Button variant="outline" size="sm">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}