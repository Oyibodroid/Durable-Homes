import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Eye, Package, Truck, CheckCircle, XCircle, Filter } from 'lucide-react'

export default async function AdminOrdersPage({
  searchParams,
}: {
  // ✅ searchParams is a Promise in Next.js 15+
  searchParams: Promise<{ status?: string; page?: string; from?: string; to?: string }>
}) {
  // ✅ Await searchParams before accessing properties
  const { status: statusParam, page: pageParam, from, to } = await searchParams

  const page = Number(pageParam) || 1
  const limit = 10
  const skip = (page - 1) * limit

  const where: any = {}

  if (statusParam && statusParam !== 'all') {
    where.status = statusParam
  }

  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  const [orders, total, orderStats] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true, images: { take: 1 } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ['status'], _count: true }),
  ])

  const totalPages = Math.ceil(total / limit)

  const statusColors = {
    PENDING:    'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED:    'bg-purple-100 text-purple-800',
    DELIVERED:  'bg-green-100 text-green-800',
    CANCELLED:  'bg-red-100 text-red-800',
    REFUNDED:   'bg-gray-100 text-gray-800',
  }

  const statusIcons = {
    PENDING:    Package,
    PROCESSING: Package,
    SHIPPED:    Truck,
    DELIVERED:  CheckCircle,
    CANCELLED:  XCircle,
    REFUNDED:   XCircle,
  }

  const statusCounts = orderStats.reduce((acc, stat) => {
    acc[stat.status] = stat._count
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {/* Status Summary */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {Object.entries(statusColors).map(([status, color]) => (
          <Link
            key={status}
            href={`/admin/orders?status=${status}`}
            className={`${color} p-4 rounded-lg text-center hover:opacity-80 transition`}
          >
            <div className="font-bold text-lg">{statusCounts[status] || 0}</div>
            <div className="text-xs uppercase">{status}</div>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form className="flex gap-4 items-end flex-wrap">
          <div className="w-48">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              defaultValue={statusParam ?? 'all'}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="all">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <Button type="submit" variant="outline" className="mb-0.5">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Order #</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const StatusIcon =
                statusIcons[order.status as keyof typeof statusIcons] ?? Package

              return (
                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">
                        {order.user?.email || order.guestEmail}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <p className="font-medium">{order.items.length} item(s)</p>
                      <p className="text-gray-500">
                        {order.items
                          .map((i) => i.product.name)
                          .slice(0, 2)
                          .join(', ')}
                        {order.items.length > 2 && '...'}
                      </p>
                    </div>
                  </td>
                  {/* ✅ Wrap Decimal in Number() before calling toLocaleString */}
                  <td className="px-6 py-4 font-medium">
                    ₦{Number(order.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                        statusColors[order.status as keyof typeof statusColors]
                      }`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        order.paymentStatus === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const params = new URLSearchParams()
              if (statusParam) params.set('status', statusParam)
              if (from) params.set('from', from)
              if (to) params.set('to', to)
              params.set('page', p.toString())

              return (
                <Link
                  key={p}
                  href={`/admin/orders?${params.toString()}`}
                  className={`px-4 py-2 rounded-lg ${
                    p === page
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}