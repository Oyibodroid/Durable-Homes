'use client'

import { useEffect, useState, use } from 'react' // Add 'use' import
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  Package, 
  Tag, 
  DollarSign,
  Layers,
  AlertCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface ProductImage {
  id: string
  url: string
  isMain: boolean
  position: number
}

interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number | null
  quantity: number
  options: any
  image: string | null
}

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string
  shortDescription: string | null
  price: number
  compareAtPrice: number | null
  cost: number | null
  quantity: number
  reservedQuantity: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK'
  categoryId: string | null
  featured: boolean
  images: ProductImage[]
  variants: ProductVariant[]
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }> // params is a Promise
}) {
  // Unwrap params using React.use()
  const { id } = use(params)
  
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    cost: '',
    quantity: '',
    categoryId: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK',
    featured: false,
  })
  const [images, setImages] = useState<ProductImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean; imageId?: string; variantId?: string}>({
    isOpen: false
  })
  const [previewModal, setPreviewModal] = useState<{isOpen: boolean; imageUrl?: string}>({
    isOpen: false
  })

  useEffect(() => {
    loadProduct()
    loadCategories()
  }, [id]) // Add id to dependency array

  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`) // Use id directly
      if (!res.ok) throw new Error('Failed to load product')
      
      const data = await res.json()
      setProduct(data)
      
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        description: data.description || '',
        shortDescription: data.shortDescription || '',
        price: data.price?.toString() || '',
        compareAtPrice: data.compareAtPrice?.toString() || '',
        cost: data.cost?.toString() || '',
        quantity: data.quantity?.toString() || '',
        categoryId: data.categoryId || '',
        status: data.status || 'DRAFT',
        featured: data.featured || false,
      })
      setImages(data.images || [])
      setVariants(data.variants || [])
    } catch (error) {
      toast.error('Failed to load product')
      router.push('/admin/products')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Upload new images first
      const uploadedUrls = []
      for (const file of newImages) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (!uploadRes.ok) throw new Error('Failed to upload image')
        const { url } = await uploadRes.json()
        uploadedUrls.push(url)
      }

      // Combine existing and new images
      const allImages = [
        ...images.map(img => img.url),
        ...uploadedUrls
      ]

      // Update product
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          quantity: parseInt(formData.quantity) || 0,
          images: allImages,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update product')
      }

      toast.success('Product updated successfully')
      router.push(`/admin/products/${id}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      // Validate file types
      const validFiles = files.filter(file => 
        ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)
      )
      
      if (validFiles.length !== files.length) {
        toast.error('Some files were skipped. Only JPEG, PNG, WEBP, and GIF are allowed.')
      }
      
      setNewImages([...newImages, ...validFiles])
    }
  }

  const removeImage = async (imageId: string, index: number, isExisting: boolean) => {
    if (isExisting) {
      // Delete from server
      try {
        const res = await fetch(`/api/upload?url=${encodeURIComponent(images[index].url)}`, {
          method: 'DELETE',
        })
        if (res.ok) {
          setImages(images.filter((_, i) => i !== index))
          toast.success('Image removed')
        }
      } catch (error) {
        toast.error('Failed to remove image')
      }
    } else {
      setNewImages(newImages.filter((_, i) => i !== index))
    }
    setDeleteModal({ isOpen: false })
  }

  const setMainImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }))
    setImages(updatedImages)
    toast.success('Main image updated')
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `temp-${Date.now()}`,
      name: '',
      sku: '',
      price: null,
      quantity: 0,
      options: {},
      image: null,
    }
    setVariants([...variants, newVariant])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
    setDeleteModal({ isOpen: false })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <p className="text-gray-600 mb-6">The product you're trying to edit doesn't exist.</p>
        <Link href="/admin/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/products/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-600 mt-1">SKU: {product.sku}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Dangote Cement 42.5R"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                placeholder="e.g., CEM-DG-001"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Short Description
            </label>
            <Input
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief summary (max 255 characters)"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Full Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
              placeholder="Detailed product description, specifications, and features..."
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-400" />
            Pricing & Inventory
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (₦) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Compare at Price (₦)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.compareAtPrice}
                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Cost (₦)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Feature this product on homepage</span>
            </label>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-gray-400" />
            Product Images
          </h2>
          
          {/* Image Gallery */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Existing Images */}
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={image.url}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {image.isMain && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Main
                    </span>
                  )}
                </div>
                
                {/* Image Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="bg-white hover:bg-gray-100"
                    onClick={() => setPreviewModal({ isOpen: true, imageUrl: image.url })}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!image.isMain && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="bg-white hover:bg-gray-100"
                      onClick={() => setMainImage(index)}
                    >
                      <span className="text-xs font-bold">★</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="bg-white hover:bg-red-50 text-red-600"
                    onClick={() => setDeleteModal({ isOpen: true, imageId: image.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {/* New Images */}
            {newImages.map((file, index) => (
              <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`New upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="bg-white hover:bg-red-50 text-red-600"
                    onClick={() => setDeleteModal({ isOpen: true })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Upload Placeholder */}
            <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition cursor-pointer bg-gray-50">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="h-full flex flex-col items-center justify-center text-gray-500 hover:text-primary">
                <Upload className="h-8 w-8 mb-2" />
                <span className="text-xs text-center">Upload Images</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Supported formats: JPEG, PNG, WEBP, GIF (max 5MB each)
          </p>
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Product Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          {variants.length > 0 ? (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={variant.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">Variant {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeleteModal({ isOpen: true, variantId: variant.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Input
                      placeholder="Name (e.g., 50kg)"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(index, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={variant.quantity}
                      onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              No variants yet. Click "Add Variant" to create product variations.
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Link href={`/admin/products/${id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={() => {
          if (deleteModal.imageId) {
            const index = images.findIndex(img => img.id === deleteModal.imageId)
            if (index !== -1) removeImage(deleteModal.imageId, index, true)
          } else if (deleteModal.variantId) {
            const index = variants.findIndex(v => v.id === deleteModal.variantId)
            if (index !== -1) removeVariant(index)
          } else {
            // Removing new image
            setNewImages([])
          }
        }}
        title="Confirm Delete"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Image Preview Modal */}
      {previewModal.isOpen && previewModal.imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewModal({ isOpen: false })}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
            <Image
              src={previewModal.imageUrl}
              alt="Preview"
              width={1200}
              height={1200}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}