import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function updateDiscount(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return

  const id = formData.get('id') as string
  const type = formData.get('type') as string
  const value = parseFloat(formData.get('value') as string)
  const minPurchase = formData.get('minPurchase') ? parseFloat(formData.get('minPurchase') as string) : null
  const maxDiscount = formData.get('maxDiscount') ? parseFloat(formData.get('maxDiscount') as string) : null
  const usageLimit = formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string) : null
  const startDate = new Date(formData.get('startDate') as string)
  const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : null
  const isActive = formData.get('isActive') === 'true'

  await prisma.discount.update({
    where: { id },
    data: { type, value, minPurchase, maxDiscount, usageLimit, startDate, endDate, isActive },
  })

  revalidatePath('/admin/discounts')
  redirect('/admin/discounts')
}

export default async function EditDiscountPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const { id } = params
  const discount = await prisma.discount.findUnique({ where: { id } })
  if (!discount) notFound()

  const toDateInput = (d: Date | null) => d ? new Date(d).toISOString().split('T')[0] : ''

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/discounts">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Discount</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form action={updateDiscount} className="space-y-5">
          <input type="hidden" name="id" value={discount.id} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Code</label>
            <input
              value={discount.code}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">Code cannot be changed after creation.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
              <select name="type" defaultValue={discount.type} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value <span className="text-red-500">*</span></label>
              <input name="value" type="number" min="0" step="0.01" required defaultValue={Number(discount.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase (₦)</label>
              <input name="minPurchase" type="number" min="0" defaultValue={discount.minPurchase ? Number(discount.minPurchase) : ''} placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₦)</label>
              <input name="maxDiscount" type="number" min="0" defaultValue={discount.maxDiscount ? Number(discount.maxDiscount) : ''} placeholder="Optional" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
            <input name="usageLimit" type="number" min="1" defaultValue={discount.usageLimit ?? ''} placeholder="Leave blank for unlimited" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
              <input name="startDate" type="date" required defaultValue={toDateInput(discount.startDate)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input name="endDate" type="date" defaultValue={toDateInput(discount.endDate)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="isActive" defaultValue={String(discount.isActive)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">Save Changes</Button>
            <Link href="/admin/discounts"><Button variant="outline">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  )
}