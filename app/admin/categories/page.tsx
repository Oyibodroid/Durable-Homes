import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Tag, Trash2, Edit, Plus } from 'lucide-react'

async function deleteCategory(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return
  const id = formData.get('id') as string
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath('/admin/categories')
  } catch {
    // Category may have products — silently fail, UI should handle
  }
}

export default async function AdminCategoriesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true, children: true } },
      parent: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Link href="/admin/categories/new">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />Add Category
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Parent</th>
              <th className="px-6 py-3">Products</th>
              <th className="px-6 py-3">Subcategories</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.slug}</p>
                </td>
                <td className="px-6 py-4 text-gray-500">{cat.parent?.name ?? '—'}</td>
                <td className="px-6 py-4">{cat._count.products}</td>
                <td className="px-6 py-4">{cat._count.children}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/categories/${cat.id}/edit`}>
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                    </Link>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" disabled={cat._count.products > 0}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Tag className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p>No categories yet. Add your first category.</p>
          </div>
        )}
      </div>
    </div>
  )
}