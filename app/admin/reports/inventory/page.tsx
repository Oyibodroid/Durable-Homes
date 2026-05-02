import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Package, AlertTriangle, TrendingDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default async function InventoryReportsPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const [totalProducts, totalValue, lowStockCount, outOfStockCount] = await Promise.all([
    prisma.product.count(),
    prisma.product.aggregate({
      _sum: { price: true },
    }),
    prisma.product.count({
      where: { quantity: { lt: 10 } },
    }),
    prisma.product.count({
      where: { quantity: 0 },
    }),
  ])

  const lowStockProducts = await prisma.product.findMany({
    where: { quantity: { lt: 10 } },
    include: {
      category: true,
    },
    orderBy: { quantity: 'asc' },
    take: 20,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Inventory Reports</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{(totalValue._sum.price || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="pb-2">Product</th>
                <th className="pb-2">SKU</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Current Stock</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="py-2 font-medium">{product.name}</td>
                  <td className="py-2">{product.sku}</td>
                  <td className="py-2">{product.category?.name}</td>
                  <td className="py-2">
                    <span className={product.quantity === 0 ? 'text-red-600 font-bold' : 'text-amber-600'}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {product.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="py-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm">Restock</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}