import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Percent, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

async function toggleDiscount(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return
  const id = formData.get('id') as string
  const current = formData.get('isActive') === 'true'
  await prisma.discount.update({ where: { id }, data: { isActive: !current } })
  revalidatePath('/admin/discounts')
}

async function deleteDiscount(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return
  const id = formData.get('id') as string
  await prisma.discount.delete({ where: { id } })
  revalidatePath('/admin/discounts')
}

export default async function AdminDiscountsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const discounts = await prisma.discount.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Discounts</h1>
        <Link href="/admin/discounts/new">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />Create Discount
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Value</th>
              <th className="px-6 py-3">Used</th>
              <th className="px-6 py-3">Expires</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => {
              const expired = discount.endDate && new Date(discount.endDate) < new Date()
              return (
                <tr key={discount.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {discount.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">{discount.type}</td>
                  <td className="px-6 py-4 font-medium">
                    {discount.type === 'percentage'
                      ? `${Number(discount.value)}% off`
                      : `₦${Number(discount.value).toLocaleString()} off`}
                  </td>
                  <td className="px-6 py-4">
                    {discount.usageCount}
                    {discount.usageLimit ? ` / ${discount.usageLimit}` : ''}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {discount.endDate
                      ? new Date(discount.endDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'No expiry'}
                  </td>
                  <td className="px-6 py-4">
                    {expired ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Expired</span>
                    ) : discount.isActive ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <form action={toggleDiscount}>
                        <input type="hidden" name="id" value={discount.id} />
                        <input type="hidden" name="isActive" value={String(discount.isActive)} />
                        <Button type="submit" variant="ghost" size="sm" title={discount.isActive ? 'Deactivate' : 'Activate'}>
                          {discount.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        </Button>
                      </form>
                      <Link href={`/admin/discounts/${discount.id}/edit`}>
                        <Button variant="ghost" size="sm" className="text-sm">Edit</Button>
                      </Link>
                      <form action={deleteDiscount}>
                        <input type="hidden" name="id" value={discount.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {discounts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Percent className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p>No discounts yet. Create your first discount code.</p>
          </div>
        )}
      </div>
    </div>
  )
}