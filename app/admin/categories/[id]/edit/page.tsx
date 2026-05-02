'use client'

import { useEffect, useState, use } from 'react'   // ← added `use`
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { ArrowLeft, Save } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
}

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)            // ← unwrap params here, once
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  })

  useEffect(() => {
    loadCategory()
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadCategory = async () => {
    try {
      const res = await fetch(`/api/categories/${id}`)   // use `id` directly
      const category = await res.json()
      
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentId: category.parentId || '',
      })
    } catch (error) {
      toast.error('Failed to load category')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      // Filter out current category and its children to prevent circular references
      setCategories(data.filter((c: Category) => c.id !== id))   // use `id`
    } catch (error) {
      console.error('Failed to load categories')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch(`/api/categories/${id}`, {   // use `id`
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error()

      toast.success('Category updated successfully')
      router.push('/admin/categories')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update category')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Category</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">None (Top Level)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/admin/categories">
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
      </div>
    </div>
  )
}