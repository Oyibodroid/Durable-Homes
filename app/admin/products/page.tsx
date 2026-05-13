import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Package, Edit, Trash2, Eye, Star } from 'lucide-react'

async function deleteProduct(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return
  const id = formData.get('id') as string
  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/products')
  } catch (e) { console.error('Delete failed:', e) }
}

async function toggleFeatured(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return
  const id = formData.get('id') as string
  const current = formData.get('featured') === 'true'
  await prisma.product.update({ where: { id }, data: { featured: !current } })
  revalidatePath('/admin/products')
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; status?: string; page?: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const { search, category, status, page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const limit = 15
  const skip = (page - 1) * limit

  const where: any = {}
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { sku: { contains: search, mode: 'insensitive' } },
  ]
  if (category) where.categoryId = category
  if (status) where.status = status

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isMain: true }, take: 1 },
        category: { select: { name: true } },
        _count: { select: { orderItems: true, reviews: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{total} products total</p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold px-5 py-2.5 text-sm transition-colors">
          <Plus className="h-4 w-4" />Add Product
        </Link>
      </div>

      {/* Filters */}
      <form className="bg-white border border-gray-100 p-4 flex gap-4 items-end flex-wrap">
        <div className="flex items-center border border-gray-200 focus-within:border-[#C9A84C] transition-colors">
          <Search className="h-4 w-4 text-gray-400 ml-3 flex-shrink-0" />
          <input name="search" defaultValue={search} placeholder="Search by name or SKU..."
            className="px-3 py-2 text-sm outline-none bg-transparent w-56" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
          <select name="category" defaultValue={category ?? ''}
            className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] w-48">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
          <select name="status" defaultValue={status ?? ''}
            className="border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]">
            <option value="">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <button type="submit"
          className="bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008] font-bold px-5 py-2 text-sm transition-all">
          Filter
        </button>
        {(search || category || status) && (
          <Link href="/admin/products" className="text-sm text-gray-400 hover:text-gray-600 self-center">Clear</Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Sales', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-gray-400 text-sm">
                  <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  No products found
                </td></tr>
              ) : products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#faf9f6] flex-shrink-0 relative overflow-hidden border border-gray-100">
                        {product.images[0] ? (
                          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{product.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{product.category?.name ?? '—'}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">₦{Number(product.price).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${
                      product.quantity === 0 ? 'text-red-600' :
                      product.quantity < 10 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {product.quantity === 0 ? 'Out of stock' : `${product.quantity} units`}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{product._count.orderItems} sold</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 ${
                      product.status === 'PUBLISHED' ? 'bg-green-50 text-green-700' :
                      product.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'
                    }`}>{product.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <form action={toggleFeatured}>
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="featured" value={String(product.featured)} />
                      <button type="submit" title={product.featured ? 'Remove featured' : 'Mark featured'}>
                        <Star className={`h-4 w-4 transition-colors ${product.featured ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-300 hover:text-[#C9A84C]'}`} />
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/shop/${product.slug}`} target="_blank"
                        className="p-1.5 text-gray-400 hover:text-gray-700 border border-transparent hover:border-gray-200 transition-all">
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-[#C9A84C] border border-transparent hover:border-[#C9A84C]/30 transition-all">
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <form action={deleteProduct} onSubmit={e => { if (!confirm(`Delete "${product.name}"?`)) e.preventDefault() }}>
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit"
                          className="p-1.5 text-gray-400 hover:text-red-500 border border-transparent hover:border-red-200 transition-all">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          {page > 1 && (
            <Link href={`/admin/products?page=${page-1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
              className="px-4 py-2 border border-gray-200 text-sm text-gray-600 hover:border-[#C9A84C] transition-colors">← Prev</Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/admin/products?page=${p}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
              className={`w-10 h-10 flex items-center justify-center text-sm ${p === page ? 'bg-[#C9A84C] text-[#111008] font-bold' : 'border border-gray-200 text-gray-600 hover:border-[#C9A84C]'}`}>
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={`/admin/products?page=${page+1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
              className="px-4 py-2 border border-gray-200 text-sm text-gray-600 hover:border-[#C9A84C] transition-colors">Next →</Link>
          )}
        </div>
      )}
    </div>
  )
}