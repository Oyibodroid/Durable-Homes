import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react'
import Image from 'next/image'
import { revalidatePath } from 'next/cache'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'


async function deleteProduct(formData: FormData) {
  'use server'
  
  const id = formData.get('id') as string
  
  try {
    await prisma.product.delete({
      where: { id },
    })
    
    revalidatePath('/admin/products')
  } catch (error) {
    console.error('Failed to delete product:', error)
  }
}

interface SearchParams {
  q?: string
  page?: string
  category?: string
  status?: string
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> // Note: searchParams is a Promise
}) {
  // Await the searchParams
  const params = await searchParams
  
  const page = Number(params.page) || 1
  const limit = 10
  const skip = (page - 1) * limit

  const where: any = {}
  
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: 'insensitive' } },
      { sku: { contains: params.q, mode: 'insensitive' } },
    ]
  }
  
  if (params.category && params.category !== 'all') {
    where.categoryId = params.category
  }
  
  if (params.status && params.status !== 'all') {
    where.status = params.status
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
        images: { 
          take: 1,
          orderBy: { position: 'asc' }
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  // Helper function to build pagination URLs
  const buildPaginationUrl = (pageNum: number) => {
    const urlParams = new URLSearchParams()
    
    if (params.q) urlParams.set('q', params.q)
    if (params.category && params.category !== 'all') urlParams.set('category', params.category)
    if (params.status && params.status !== 'all') urlParams.set('status', params.status)
    if (pageNum > 1) urlParams.set('page', pageNum.toString())
    
    return `/admin/products?${urlParams.toString()}`
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={params.q || ''}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div className="w-48">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" className="w-full border rounded-lg px-3 py-2" defaultValue={params.category || 'all'}>
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-48">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" className="w-full border rounded-lg px-3 py-2" defaultValue={params.status || 'all'}>
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
          
          <Button type="submit" variant="outline" className="mb-0.5">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                    {product.images[0] && (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">
                  <Link href={`/admin/products/${product.id}`} className="text-primary hover:underline">
                    {product.name}
                  </Link>
                </td>
                <td className="px-6 py-4">{product.sku}</td>
                <td className="px-6 py-4">{product.category?.name || 'Uncategorized'}</td>
                <td className="px-6 py-4">₦{product.price.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={product.quantity < 10 ? 'text-amber-600 font-medium' : ''}>
                    {product.quantity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${product.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : ''}
                    ${product.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : ''}
                    ${product.status === 'ARCHIVED' ? 'bg-red-100 text-red-800' : ''}
                    ${product.status === 'OUT_OF_STOCK' ? 'bg-amber-100 text-amber-800' : ''}
                  `}>
                    {product.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/shop/${product.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteProductButton 
                      productId={product.id} 
                      productName={product.name} 
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildPaginationUrl(p)}
                className={`px-4 py-2 rounded-lg ${
                  p === page
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}