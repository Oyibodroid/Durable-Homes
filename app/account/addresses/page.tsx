import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/Button'
import { MapPin, Plus, Trash2, Star } from 'lucide-react'

async function deleteAddress(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session) return
  const id = formData.get('id') as string
  await prisma.address.deleteMany({ where: { id, userId: session.user.id } })
  revalidatePath('/account/addresses')
}

async function setDefault(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session) return
  const id = formData.get('id') as string
  const type = formData.get('type') as string
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.user.id, type }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ])
  revalidatePath('/account/addresses')
}

export default async function AccountAddressesPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Addresses</h1>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-medium text-gray-700 mb-2">No saved addresses</h2>
          <p className="text-gray-500 text-sm">Your addresses will appear here after you place an order.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className={`bg-white rounded-lg shadow p-5 border-2 ${address.isDefault ? 'border-yellow-400' : 'border-transparent'}`}>
              {address.isDefault && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full mb-3">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />Default
                </span>
              )}
              <p className="font-semibold text-gray-900">{address.firstName} {address.lastName}</p>
              <address className="not-italic text-sm text-gray-600 mt-1 space-y-0.5">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state}</p>
                <p>{address.country}</p>
                {address.phone && <p>{address.phone}</p>}
              </address>
              <div className="flex gap-2 mt-4">
                {!address.isDefault && (
                  <form action={setDefault}>
                    <input type="hidden" name="id" value={address.id} />
                    <input type="hidden" name="type" value={address.type} />
                    <Button type="submit" variant="outline" size="sm">Set as Default</Button>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <Button type="submit" variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}