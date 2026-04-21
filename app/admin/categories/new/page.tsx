import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createCategory(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return

  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string).trim()
  const parentId = (formData.get('parentId') as string) || null

  if (!name) return

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  try {
    await prisma.category.create({
      data: { name, slug, description: description || null, parentId },
    })
    revalidatePath('/admin/categories')
  } catch {
    // slug conflict — append timestamp
    await prisma.category.create({
      data: { name, slug: `${slug}-${Date.now()}`, description: description || null, parentId },
    })
    revalidatePath('/admin/categories')
  }

  redirect('/admin/categories')
}

export default async function NewCategoryPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const parentCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">New Category</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form action={createCategory} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="e.g. Cement & Concrete"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">The slug will be auto-generated from the name.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Optional description..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select
              name="parentId"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">None (top-level category)</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
              Create Category
            </Button>
            <Link href="/admin/categories">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}