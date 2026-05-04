'use client'

import { useEffect, useState, use } from 'react'
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
  DollarSign,
  Layers,
  AlertCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface ProductImage {
  id?: string
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
  sku: string
  description: string
  shortDescription: string | null
  price: number
  compareAtPrice: number | null
  cost: number | null
  quantity: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK'
  categoryId: string | null
  featured: boolean
  images: ProductImage[]
  variants: ProductVariant[]
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
    status: 'DRAFT' as Product['status'],
    featured: false,
  })

  const [images, setImages] = useState<ProductImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean; index?: number; isExisting?: boolean}>({
    isOpen: false
  })
  const [previewModal, setPreviewModal] = useState<{isOpen: boolean; imageUrl?: string}>({
    isOpen: false
  })

  useEffect(() => {
    loadProduct()
    loadCategories()
  }, [id])

  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`)
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
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // 1. Upload new files
      const uploadedUrls: string[] = []
      for (const file of newImages) {
        const uploadData = new FormData()
        uploadData.append('file', file)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        })
        if (!uploadRes.ok) throw new Error('Failed to upload image')
        const { url } = await uploadRes.json()
        uploadedUrls.push(url)
      }

      // 2. Map existing and new images into the Correct Schema
      const finalImages = [
        ...images.map((img, idx) => ({
          url: img.url,
          isMain: img.isMain,
          position: idx
        })),
        ...uploadedUrls.map((url, idx) => ({
          url: url,
          isMain: images.length === 0 && idx === 0, // Main if first image
          position: images.length + idx
        }))
      ]

      // 3. Final submission
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          quantity: parseInt(formData.quantity) || 0,
          images: finalImages,
          variants: variants
        }),
      })

      if (!res.ok) throw new Error('Failed to update product')

      toast.success('Product updated')
      router.push(`/admin/products/${id}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setNewImages([...newImages, ...files])
    }
  }

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const wasMain = images[index].isMain
      const updated = images.filter((_, i) => i !== index)
      
      // Auto-promote new main image if deleted one was main
      if (wasMain && updated.length > 0) {
        updated[0].isMain = true
      }
      setImages(updated)
    } else {
      setNewImages(newImages.filter((_, i) => i !== index))
    }
    setDeleteModal({ isOpen: false })
  }

  const setMainImage = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }))
    setImages(updated)
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  if (isLoading) return <div className="p-20 text-center">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold">Edit {product?.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label className="text-sm font-medium">SKU</label>
              <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea 
              className="w-full p-3 border rounded-md min-h-[120px]" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </section>

        {/* Pricing & Inventory */}
        <section className="bg-white p-6 rounded-xl shadow-sm border grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Price (₦)</label>
            <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Stock Quantity</label>
            <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <select 
              className="w-full p-2 border rounded-md h-10" 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </section>

        {/* Image Management */}
        <section className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <div className="grid grid-cols-5 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group aspect-square border rounded-lg overflow-hidden">
                <Image src={img.url} alt="product" fill className="object-cover" />
                {img.isMain && <div className="absolute top-1 left-1 bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded shadow">Main</div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 bg-white" onClick={() => setMainImage(idx)}><Save className="h-3 w-3" /></Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8 bg-white text-red-600" onClick={() => setDeleteModal({isOpen: true, index: idx, isExisting: true})}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
            {newImages.map((file, idx) => (
              <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden opacity-70">
                <Image src={URL.createObjectURL(file)} alt="preview" fill className="object-cover" />
                <button type="button" className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded" onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}><X className="h-3 w-3" /></button>
              </div>
            ))}
            <label className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 aspect-square">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-[10px] mt-2">Add New</span>
              <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
        </section>

        {/* Variants */}
        <section className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { id: Date.now().toString(), name: '', sku: '', price: null, quantity: 0, options: {}, image: null }])}>
              <Plus className="h-4 w-4 mr-1" /> Add Variant
            </Button>
          </div>
          {variants.map((v, idx) => (
            <div key={v.id} className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg relative">
              <Input placeholder="Size/Color" value={v.name} onChange={e => updateVariant(idx, 'name', e.target.value)} />
              <Input placeholder="SKU" value={v.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)} />
              <Input type="number" placeholder="Price" value={v.price || ''} onChange={e => updateVariant(idx, 'price', parseFloat(e.target.value))} />
              <div className="flex gap-2">
                <Input type="number" placeholder="Stock" value={v.quantity} onChange={e => updateVariant(idx, 'quantity', parseInt(e.target.value))} />
                <Button type="button" variant="ghost" className="text-red-600" onClick={() => setVariants(variants.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </section>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>

      <ConfirmModal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({isOpen: false})} 
        onConfirm={() => removeImage(deleteModal.index!, deleteModal.isExisting!)}
        title="Delete Image?"
        message="This will remove the image from the product gallery."
      />
    </div>
  )
}