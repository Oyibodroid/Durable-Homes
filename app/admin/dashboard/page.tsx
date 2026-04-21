import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import Link from 'next/link'
import {
  RevenueChart,
  OrderStatusChart,
  TopProductsChart,
} from '@/components/admin/DashboardCharts'

async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Last 7 days for revenue chart
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers,
    lowStockProducts,
    recentOrders,
    popularProducts,
    monthlyRevenue,
    lastMonthRevenue,
    last7DaysOrders,
    ordersByStatus,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.product.findMany({
      where: { quantity: { lt: 10 }, status: 'PUBLISHED' },
      take: 5,
      orderBy: { quantity: 'asc' },
      select: { id: true, name: true, quantity: true, sku: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { take: 1, include: { product: { select: { name: true } } } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'COMPLETED', createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { total: true },
    }),
    // Last 7 days orders with totals for revenue chart
    prisma.order.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Orders grouped by status for donut chart
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  // Get product details for popular products
  const popularProductsWithDetails = await Promise.all(
    popularProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          name: true,
          price: true,
          images: { take: 1, select: { url: true } },
        },
      })
      return { ...item, product }
    })
  )

  // Build daily revenue data for last 7 days
  const dailyRevenueMap = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
    dailyRevenueMap.set(key, 0)
  }
  for (const order of last7DaysOrders) {
    const key = new Date(order.createdAt).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
    })
    if (dailyRevenueMap.has(key)) {
      dailyRevenueMap.set(
        key,
        (dailyRevenueMap.get(key) ?? 0) + Number(order.total)
      )
    }
  }
  const revenueChartData = Array.from(dailyRevenueMap.entries()).map(
    ([date, revenue]) => ({ date, revenue })
  )

  // Order status donut data
  const statusColors: Record<string, string> = {
    PENDING: '#F59E0B',
    PROCESSING: '#3B82F6',
    SHIPPED: '#8B5CF6',
    DELIVERED: '#10B981',
    CANCELLED: '#EF4444',
    REFUNDED: '#6B7280',
    ON_HOLD: '#F97316',
  }
  const orderStatusData = ordersByStatus.map((s) => ({
    name: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
    value: s._count,
    color: statusColors[s.status] ?? '#6B7280',
  }))

  // Top products bar chart data
  const topProductsChartData = popularProductsWithDetails
    .filter((p) => p.product)
    .map((p) => ({
      name:
        (p.product?.name ?? 'Unknown').length > 20
          ? (p.product?.name ?? '').substring(0, 20) + '…'
          : (p.product?.name ?? 'Unknown'),
      revenue: Number(p._sum.total ?? 0),
    }))

  const currentMonthRev = Number(monthlyRevenue._sum.total ?? 0)
  const lastMonthRev = Number(lastMonthRevenue._sum.total ?? 0)
  const revenueGrowth =
    lastMonthRev > 0
      ? ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100
      : 100

  return {
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    totalOrders,
    totalProducts,
    totalUsers,
    lowStockProducts,
    recentOrders,
    popularProducts: popularProductsWithDetails,
    currentMonthRevenue: currentMonthRev,
    revenueGrowth,
    revenueChartData,
    orderStatusData,
    topProductsChartData,
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()
  const growthPositive = data.revenueGrowth >= 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{data.totalRevenue.toLocaleString()}
            </div>
            <p className={`text-xs flex items-center gap-1 mt-1 ${growthPositive ? 'text-green-600' : 'text-red-600'}`}>
              {growthPositive
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              {Math.abs(data.revenueGrowth).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">Active inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Registered customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue line chart — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueChartData} />
          </CardContent>
        </Card>

        {/* Orders by status donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {data.orderStatusData.length > 0 ? (
              <OrderStatusChart data={data.orderStatusData} />
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
                No order data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top products bar chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Top 5 Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {data.topProductsChartData.length > 0 ? (
            <TopProductsChart data={data.topProductsChartData} />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
              No sales data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {data.lowStockProducts.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-amber-900 hover:underline font-medium"
                  >
                    {product.name}
                  </Link>
                  <span className="font-medium text-amber-900 bg-amber-100 px-2 py-1 rounded">
                    {product.quantity} units left
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
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
                      {order.user?.name || order.guestEmail || 'Guest'}
                    </td>
                    <td className="px-6 py-4">{order.items.length} item(s)</td>
                    {/* ✅ Decimal → Number */}
                    <td className="px-6 py-4 font-medium">
                      ₦{Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                        ${order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString('en-NG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Best Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Best Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Units Sold</th>
                  <th className="px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.popularProducts.map((item) => (
                  <tr key={item.productId} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      <Link
                        href={`/admin/products/${item.productId}`}
                        className="text-primary hover:underline"
                      >
                        {item.product?.name || 'Unknown Product'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{item._sum.quantity || 0}</td>
                    {/* ✅ Decimal → Number */}
                    <td className="px-6 py-4">
                      ₦{Number(item._sum.total ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}