import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default async function SalesReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>   // ✅ Promise
}) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const params = await searchParams                              // ✅ await here
  const period = params.period || 'month'
  
  // Calculate date range based on period
  const now = new Date()
  let startDate = new Date()
  
  if (period === 'day') {
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    startDate.setDate(now.getDate() - 7)
  } else if (period === 'month') {
    startDate.setMonth(now.getMonth() - 1)
  } else if (period === 'year') {
    startDate.setFullYear(now.getFullYear() - 1)
  } else if (period === 'custom' && params.from && params.to) {   // ✅ use params.from / params.to
    startDate = new Date(params.from)
  }

  const endDate = params.to ? new Date(params.to) : now

  const [totalRevenue, orderCount, averageOrderValue, dailyStats] = await Promise.all([
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
      },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate },
      },
      _avg: { total: true },
    }),
    // Get daily stats for chart
    prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM orders
      WHERE payment_status = 'COMPLETED'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `,
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <div className="flex gap-2">
          <Link href={`/admin/reports/sales?period=day`}>
            <Button variant={period === 'day' ? 'default' : 'outline'} size="sm">Day</Button>
          </Link>
          <Link href={`/admin/reports/sales?period=week`}>
            <Button variant={period === 'week' ? 'default' : 'outline'} size="sm">Week</Button>
          </Link>
          <Link href={`/admin/reports/sales?period=month`}>
            <Button variant={period === 'month' ? 'default' : 'outline'} size="sm">Month</Button>
          </Link>
          <Link href={`/admin/reports/sales?period=year`}>
            <Button variant={period === 'year' ? 'default' : 'outline'} size="sm">Year</Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{(totalRevenue._sum.total || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              For selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-xs text-gray-500">
              Completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{((averageOrderValue._avg.total || 0)).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              Per order average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
            <p className="text-xs text-gray-400 mt-2">(Integrate with Chart.js or Recharts)</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="pb-2">Product</th>
                <th className="pb-2">Units Sold</th>
                <th className="pb-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-t">
                  <td className="py-2">Sample Product {i}</td>
                  <td className="py-2">{Math.floor(Math.random() * 50)}</td>
                  <td className="py-2">₦{(Math.random() * 100000).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}