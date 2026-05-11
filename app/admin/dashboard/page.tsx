import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardCharts } from '@/components/admin/DashboardCharts'
import { TrendingUp, TrendingDown, ShoppingCart, Package, Users, DollarSign, AlertTriangle } from 'lucide-react'

async function getData() {
  const now = new Date()

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  )

  const startOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  )

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  // ─────────────────────────────────────────────
  // Run SMALL queries together
  // ─────────────────────────────────────────────

  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.count(),

    prisma.product.count(),

    prisma.user.count(),
  ])

  // ─────────────────────────────────────────────
  // Run medium queries separately
  // ─────────────────────────────────────────────

  const lowStock = await prisma.product.findMany({
    where: {
      quantity: { lt: 10 },
      status: 'PUBLISHED',
    },
    take: 5,
    orderBy: {
      quantity: 'asc',
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      sku: true,
    },
  })

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },

      items: {
        take: 1,
      },
    },
  })

  // ─────────────────────────────────────────────
  // Get top products
  // ─────────────────────────────────────────────

  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ['productId'],

    _sum: {
      quantity: true,
      total: true,
    },

    orderBy: {
      _sum: {
        total: 'desc',
      },
    },

    take: 5,
  })

  // Fetch all products in ONE query
  const productIds = topProductsRaw.map(
    (p) => p.productId
  )

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },

    select: {
      id: true,
      name: true,
    },
  })

  const productMap = new Map(
    products.map((p) => [p.id, p])
  )

  const topProducts = topProductsRaw.map((item) => ({
    ...item,
    product: productMap.get(item.productId),
  }))

  // ─────────────────────────────────────────────
  // Revenue stats
  // ─────────────────────────────────────────────

  const monthRev = await prisma.order.aggregate({
    where: {
      paymentStatus: 'COMPLETED',

      createdAt: {
        gte: startOfMonth,
      },
    },

    _sum: {
      total: true,
    },
  })

  const lastMonthRev = await prisma.order.aggregate({
    where: {
      paymentStatus: 'COMPLETED',

      createdAt: {
        gte: startOfLastMonth,
        lt: startOfMonth,
      },
    },

    _sum: {
      total: true,
    },
  })

  // ─────────────────────────────────────────────
  // Last 7 days revenue
  // ─────────────────────────────────────────────

  const last7Orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'COMPLETED',

      createdAt: {
        gte: sevenDaysAgo,
      },
    },

    select: {
      createdAt: true,
      total: true,
    },

    orderBy: {
      createdAt: 'asc',
    },
  })

  // ─────────────────────────────────────────────
  // Orders by status
  // ─────────────────────────────────────────────

  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  })

  // ─────────────────────────────────────────────
  // Build chart data
  // ─────────────────────────────────────────────

  const dailyMap = new Map<string, number>()

  for (let i = 6; i >= 0; i--) {
    const d = new Date()

    d.setDate(d.getDate() - i)

    dailyMap.set(
      d.toLocaleDateString('en-NG', {
        month: 'short',
        day: 'numeric',
      }),
      0
    )
  }

  for (const o of last7Orders) {
    const key = new Date(
      o.createdAt
    ).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
    })

    if (dailyMap.has(key)) {
      dailyMap.set(
        key,
        (dailyMap.get(key) ?? 0) + Number(o.total)
      )
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: '#F59E0B',
    PROCESSING: '#3B82F6',
    SHIPPED: '#8B5CF6',
    DELIVERED: '#10B981',
    CANCELLED: '#EF4444',
  }

  const currentRev = Number(
    monthRev._sum.total ?? 0
  )

  const lastRev = Number(
    lastMonthRev._sum.total ?? 0
  )

  const growth =
    lastRev > 0
      ? ((currentRev - lastRev) / lastRev) * 100
      : 100

  return {
    totalRevenue: Number(
      totalRevenue._sum.total ?? 0
    ),

    totalOrders,

    totalProducts,

    totalUsers,

    lowStock,

    recentOrders,

    topProducts,

    growth,

    currentRev,

    revenueChartData: Array.from(
      dailyMap.entries()
    ).map(([date, revenue]) => ({
      date,
      revenue,
    })),

    orderStatusData: ordersByStatus.map(
      (s) => ({
        name:
          s.status.charAt(0) +
          s.status.slice(1).toLowerCase(),

        value: s._count,

        color:
          statusColors[s.status] ?? '#6B7280',
      })
    ),

    topProductsChartData: topProducts
      .filter((p) => p.product)
      .map((p) => ({
        name:
          (p.product?.name ?? '').length > 18
            ? (p.product?.name ?? '').substring(
                0,
                18
              ) + '…'
            : p.product?.name ?? '',

        revenue: Number(
          p._sum.total ?? 0
        ),
      })),
  }
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  PROCESSING: 'bg-blue-50 text-blue-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-600',
}

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')
  const data = await getData()
  const growthPos = data.growth >= 0

  const statCards = [
    { label: 'Total Revenue', value: `₦${data.totalRevenue.toLocaleString()}`, sub: `${growthPos ? '+' : ''}${data.growth.toFixed(1)}% vs last month`, icon: DollarSign, trend: growthPos },
    { label: 'Total Orders', value: data.totalOrders.toLocaleString(), sub: 'All time', icon: ShoppingCart, trend: null },
    { label: 'Products', value: data.totalProducts.toLocaleString(), sub: 'Active inventory', icon: Package, trend: null },
    { label: 'Customers', value: data.totalUsers.toLocaleString(), sub: 'Registered', icon: Users, trend: null },
  ]

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ label, value, sub, icon: Icon, trend }) => (
          <div key={label} className="bg-white border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 bg-[#C9A84C]/8 flex items-center justify-center">
                <Icon className="h-4 w-4 text-[#C9A84C]" />
              </div>
              {trend !== null && (
                <span className={`text-xs font-semibold flex items-center gap-1 ${trend ? 'text-green-600' : 'text-red-500'}`}>
                  {trend ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {sub.split('%')[0]}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{trend !== null ? 'vs last month' : sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-4 h-px bg-[#C9A84C]" />
            <h2 className="text-sm font-bold text-gray-900">Revenue — Last 7 Days</h2>
          </div>
          <DashboardCharts type="revenue" data={data.revenueChartData} />
        </div>
        <div className="bg-white border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-4 h-px bg-[#C9A84C]" />
            <h2 className="text-sm font-bold text-gray-900">Orders by Status</h2>
          </div>
          {data.orderStatusData.length > 0
            ? <DashboardCharts type="donut" data={data.orderStatusData} />
            : <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No order data</div>}
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-4 h-px bg-[#C9A84C]" />
          <h2 className="text-sm font-bold text-gray-900">Top 5 Products by Revenue</h2>
        </div>
        {data.topProductsChartData.length > 0
          ? <DashboardCharts type="bar" data={data.topProductsChartData} />
          : <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No sales data</div>}
      </div>

      {/* Low stock */}
      {data.lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-800">Low Stock Alert</h2>
          </div>
          <div className="space-y-2">
            {data.lowStock.map(p => (
              <div key={p.id} className="flex justify-between items-center">
                <Link href={`/admin/products/${p.id}`} className="text-sm text-amber-900 hover:underline font-medium">{p.name}</Link>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5">{p.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <span className="w-4 h-px bg-[#C9A84C]" />
            <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
          </div>
          <Link href="/admin/orders" className="text-xs text-[#C9A84C] font-semibold hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs text-[#C9A84C] hover:underline font-semibold">{order.orderNumber}</Link>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{order.user?.name || order.guestEmail || 'Guest'}</td>
                  <td className="px-6 py-4 text-gray-500">{order.items.length}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">₦{Number(order.total).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 ${STATUS_COLORS[order.status] ?? 'bg-gray-50 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-NG', { month:'short', day:'numeric', year:'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top products table */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
          <span className="w-4 h-px bg-[#C9A84C]" />
          <h2 className="text-sm font-bold text-gray-900">Best Sellers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                {['Product', 'Units Sold', 'Revenue'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.topProducts.map(item => (
                <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/products/${item.productId}`} className="text-gray-900 hover:text-[#C9A84C] font-medium transition-colors">
                      {item.product?.name ?? 'Unknown'}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item._sum.quantity ?? 0}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">₦{Number(item._sum.total ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}