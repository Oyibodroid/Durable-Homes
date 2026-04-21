import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Edit, ArrowLeft, Package, DollarSign, Calendar, Star } from 'lucide-react'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params // Unwrap the Promise

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { position: 'asc' }
      },
      variants: true,
      reviews: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="flex-1" />
        <Link href={`/admin/products/${product.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Product Images</h2>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.url}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {image.isMain && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
              {product.images.length === 0 && (
                <div className="col-span-4 text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No images uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            {product.shortDescription && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Short Description:</span> {product.shortDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Product Information</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">SKU</dt>
                <dd className="font-medium">{product.sku}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium">{product.category?.name || 'Uncategorized'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Price</dt>
                <dd className="font-medium text-lg">₦{product.price.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Stock</dt>
                <dd className={`font-medium ${product.quantity < 10 ? 'text-amber-600' : ''}`}>
                  {product.quantity} units
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}