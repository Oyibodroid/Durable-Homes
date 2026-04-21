import { prisma } from '@/lib/db'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/Pagination'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { 
  HardHat, 
  Package, 
  Ruler, 
  Weight,
  Filter,
  Search,
  X,
  ChevronDown,
  Grid3x3,
  LayoutList
} from 'lucide-react'
import Link from 'next/link'
import { ViewToggle } from '@/components/product/ViewToggle'

export const metadata: Metadata = {
  title: 'Building Materials & Hardware',
  description: 'Professional-grade construction materials, hardware, and supplies for contractors and homeowners.',
}

const ITEMS_PER_PAGE = 12

interface ShopPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    q?: string
    view?: 'grid' | 'list'
  }>
}

async function getProducts(searchParams: Awaited<ShopPageProps['searchParams']>) {
  const page = Number(searchParams.page) || 1
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where: any = {
    status: 'PUBLISHED',
    publishedAt: { not: null },
  }

  if (searchParams.category && searchParams.category !== 'all') {
    where.categoryId = searchParams.category
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {}
    if (searchParams.minPrice) where.price.gte = Number(searchParams.minPrice)
    if (searchParams.maxPrice) where.price.lte = Number(searchParams.maxPrice)
  }

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }

  let orderBy: any = { createdAt: 'desc' }
  switch (searchParams.sort) {
    case 'price-asc':   orderBy = { price: 'asc' };  break
    case 'price-desc':  orderBy = { price: 'desc' }; break
    case 'name-asc':    orderBy = { name: 'asc' };   break
    case 'name-desc':   orderBy = { name: 'desc' };  break
    case 'stock':       orderBy = { quantity: 'desc' }; break
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take: ITEMS_PER_PAGE, orderBy,
      include: { 
        category: true, 
        images: { where: { isMain: true }, take: 1 },
        _count: { select: { reviews: true } }
      },
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, page, totalPages: Math.ceil(total / ITEMS_PER_PAGE) }
}

async function getCategories() {
  return await prisma.category.findMany({
    include: { _count: { select: { products: true } } }
  })
}

async function getPriceRange() {
  const [min, max] = await Promise.all([
    prisma.product.findFirst({
      where: { status: 'PUBLISHED', publishedAt: { not: null } },
      orderBy: { price: 'asc' },
      select: { price: true },
    }),
    prisma.product.findFirst({
      where: { status: 'PUBLISHED', publishedAt: { not: null } },
      orderBy: { price: 'desc' },
      select: { price: true },
    }),
  ])
  return { min: min?.price || 0, max: max?.price || 1000000 }
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
      <div className="bg-gray-200 p-4 rounded-full mb-4">
        <HardHat className="h-12 w-12 text-gray-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No materials found</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        We couldn't find any products matching your criteria. Try adjusting your filters.
      </p>
      <Link
        href="/shop"
        className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
      >
        Clear filters
        <X className="ml-2 h-4 w-4" />
      </Link>
    </div>
  )
}

// Loading skeleton
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await searchParams

  const [data, categories, priceRange] = await Promise.all([
    getProducts(resolvedSearchParams),
    getCategories(),
    getPriceRange(),
  ])

  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams()
    p.set('page', String(page))
    if (resolvedSearchParams.category) p.set('category', resolvedSearchParams.category)
    if (resolvedSearchParams.sort)     p.set('sort', resolvedSearchParams.sort)
    if (resolvedSearchParams.q)        p.set('q', resolvedSearchParams.q)
    if (resolvedSearchParams.minPrice) p.set('minPrice', resolvedSearchParams.minPrice)
    if (resolvedSearchParams.maxPrice) p.set('maxPrice', resolvedSearchParams.maxPrice)
    if (resolvedSearchParams.view)     p.set('view', resolvedSearchParams.view)
    return `/shop?${p.toString()}`
  }

  const view = resolvedSearchParams.view || 'grid'
  const hasActiveFilters = 
    resolvedSearchParams.category || 
    resolvedSearchParams.minPrice || 
    resolvedSearchParams.maxPrice || 
    resolvedSearchParams.q ||
    resolvedSearchParams.sort

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Industrial Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="container px-4 py-8 py-12 md:py-16">
          <div className="max-w-3xl">
            {/* Industrial badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm border border-yellow-500/20">
                <HardHat className="h-4 w-4 mr-2" />
                Professional Grade
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/20">
                <Package className="h-4 w-4 mr-2" />
                Bulk Pricing
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/20">
                <Ruler className="h-4 w-4 mr-2" />
                Custom Cuts
              </span>
            </div>

            <h1 className="font-bold text-4xl md:text-5xl mb-4 leading-tight">
              {resolvedSearchParams.q ? (
                <>Search: <span className="text-yellow-400">"{resolvedSearchParams.q}"</span></>
              ) : (
                <>
                  Building Materials<br />
                  <span className="text-gray-400"> & Construction Supplies</span>
                </>
              )}
            </h1>
            
            {/* Stats in industrial style */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="border-l-2 border-yellow-500 pl-4">
                <p className="text-2xl font-bold text-white">{data.total}</p>
                <p className="text-sm text-gray-400">Products</p>
              </div>
              <div className="border-l-2 border-yellow-500 pl-4">
                <p className="text-2xl font-bold text-white">{categories.length}</p>
                <p className="text-sm text-gray-400">Categories</p>
              </div>
              <div className="border-l-2 border-yellow-500 pl-4">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-sm text-gray-400">Support</p>
              </div>
              <div className="border-l-2 border-yellow-500 pl-4">
                <p className="text-2xl font-bold text-white">Bulk</p>
                <p className="text-sm text-gray-400">Discounts</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Industrial pattern */}
        <div className="h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500"></div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Industrial style */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <ProductFilters
                categories={categories.map(c => ({ ...c, productCount: c._count.products }))}
                minPrice={Number(priceRange.min)}
                maxPrice={Number(priceRange.max)}
              />
              
              {/* Quick Categories */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-gray-600" />
                  Quick Categories
                </h3>
                <div className="space-y-1">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      href={`/shop?category=${category.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{category.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {category._count.products}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Industrial Info */}
              <div className="bg-gray-900 text-white rounded-xl p-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Weight className="h-4 w-4 mr-2 text-yellow-400" />
                  Bulk Orders
                </h4>
                <p className="text-sm text-gray-400 mb-3">
                  Contact us for volume discounts and contractor pricing.
                </p>
                <a
                  href="/contact"
                  className="block text-center py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium text-sm"
                >
                  Request Quote
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar - Industrial style */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Results info */}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {Math.min((data.page - 1) * ITEMS_PER_PAGE + 1, data.total)}-
                      {Math.min(data.page * ITEMS_PER_PAGE, data.total)}
                    </span>{' '}
                    of <span className="font-medium text-gray-900">{data.total}</span> items
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Clear filters */}
                  {hasActiveFilters && (
                    <Link
                      href="/shop"
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-lg hover:border-gray-400"
                    >
                      Clear
                      <X className="h-3 w-3" />
                    </Link>
                  )}
                  
                  {/* Sort dropdown - You'll need to make this a client component */}
                  <select
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    defaultValue={resolvedSearchParams.sort || 'newest'}
                    // Note: This will need to be moved to a client component
                  >
                    <option value="newest">Newest First</option>
                    <option value="stock">Stock Level</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>

                  {/* View toggle - Client component needed */}
                  <ViewToggle currentView={view} />
                </div>
              </div>
            </div>

            {/* Product Grid - Mobile: 2 columns, Desktop: 4 columns */}
            <Suspense fallback={<ProductGridSkeleton />}>
              {data.products.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className={view === 'grid' 
                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    : "space-y-4"
                  }>
                    {data.products.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        layout={view}
                      />
                    ))}
                  </div>

                  {/* Industrial Pagination */}
                  {data.totalPages > 1 && (
                    <div className="mt-10 flex justify-center">
                      <Pagination>
                        <PaginationContent className="flex items-center gap-2">
                          {/* Prev */}
                          {data.page > 1 && (
                            <PaginationItem>
                              <PaginationLink 
                                href={buildPageUrl(data.page - 1)}
                                className="bg-white border border-gray-300 hover:bg-gray-100 rounded-lg px-4 py-2 text-sm font-medium"
                              >
                                Previous
                              </PaginationLink>
                            </PaginationItem>
                          )}

                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                            let pageNum = i + 1
                            if (data.page > 3 && data.totalPages > 5) {
                              pageNum = data.page - 2 + i
                            }
                            if (pageNum <= data.totalPages) {
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    href={buildPageUrl(pageNum)}
                                    isActive={pageNum === data.page}
                                    className={`w-10 h-10 rounded-lg text-sm font-medium ${
                                      pageNum === data.page
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                                    }`}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            }
                          })}

                          {/* Next */}
                          {data.page < data.totalPages && (
                            <PaginationItem>
                              <PaginationLink 
                                href={buildPageUrl(data.page + 1)}
                                className="bg-white border border-gray-300 hover:bg-gray-100 rounded-lg px-4 py-2 text-sm font-medium"
                              >
                                Next
                              </PaginationLink>
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}