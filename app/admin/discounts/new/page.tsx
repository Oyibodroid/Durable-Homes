import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createDiscount(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return

  const code = (formData.get('code') as string).trim().toUpperCase()
  const type = formData.get('type') as string
  const value = parseFloat(formData.get('value') as string)
  const minPurchase = formData.get('minPurchase') ? parseFloat(formData.get('minPurchase') as string) : null
  const maxDiscount = formData.get('maxDiscount') ? parseFloat(formData.get('maxDiscount') as string) : null
  const usageLimit = formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string) : null
  const startDate = new Date(formData.get('startDate') as string)
  const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : null

  await prisma.discount.create({
    data: {
      code,
      type,
      value,
      minPurchase,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      isActive: true,
    },
  })

  revalidatePath('/admin/discounts')
  redirect('/admin/discounts')
}

export default async function NewDiscountPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/discounts">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">New Discount</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form action={createDiscount} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Code <span className="text-red-500">*</span>
            </label>
            <input
              name="code"
              required
              placeholder="e.g. SAVE20"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">Will be converted to uppercase automatically.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                name="value"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 20"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase (₦)</label>
              <input
                name="minPurchase"
                type="number"
                min="0"
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₦)</label>
              <input
                name="maxDiscount"
                type="number"
                min="0"
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
            <input
              name="usageLimit"
              type="number"
              min="1"
              placeholder="Leave blank for unlimited"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                name="startDate"
                type="date"
                defaultValue={today}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                name="endDate"
                type="date"
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
              Create Discount
            </Button>
            <Link href="/admin/discounts">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}