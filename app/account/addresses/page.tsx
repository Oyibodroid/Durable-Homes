import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Button } from '@/components/ui/Button'
import { MapPin, Plus, Trash2, Star, Home, Briefcase } from 'lucide-react'

// --- Server Action: Delete Address ---
async function deleteAddress(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session) return
  const id = formData.get('id') as string
  
  await prisma.address.deleteMany({ 
    where: { 
      id, 
      userId: session.user.id 
    } 
  })
  revalidatePath('/account/addresses')
}

// --- Server Action: Set Default ---
async function setDefault(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session) return
  const id = formData.get('id') as string
  const type = (formData.get('type') as string) || 'SHIPPING'
  
  await prisma.$transaction([
    prisma.address.updateMany({ 
      where: { userId: session.user.id, type }, 
      data: { isDefault: false } 
    }),
    prisma.address.update({ 
      where: { id }, 
      data: { isDefault: true } 
    }),
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
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header Grid Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/60 pb-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">Saved Addresses</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your default shipping and billing fulfillment contexts.</p>
        </div>
        {/* Pass an absolute navigation route or state context trigger to open your custom form component */}
        <Button className="bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-sm self-start sm:self-center">
          <Plus className="h-4 w-4 mr-2" /> Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center shadow-sm max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-6 w-6 text-neutral-400" />
          </div>
          <h2 className="text-base font-semibold text-neutral-900 mb-1">No saved addresses found</h2>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto mb-6">
            Your shipping destinations will automatically store here safely for future checkouts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`bg-white rounded-2xl border p-6 transition-all shadow-sm flex flex-col justify-between ${
                address.isDefault 
                  ? 'border-neutral-900 ring-1 ring-neutral-900/5 bg-neutral-50/10' 
                  : 'border-neutral-200/80 hover:border-neutral-300'
              }`}
            >
              <div>
                {/* Meta Labels */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 bg-neutral-50 border border-neutral-200/60 px-2.5 py-1 rounded-lg">
                    {address.type?.toLowerCase() === 'work' ? (
                      <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                    ) : (
                      <Home className="h-3.5 w-3.5 text-neutral-400" />
                    )}
                    <span className="capitalize">{address.type || 'Shipping'}</span>
                  </div>

                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/40 px-2.5 py-1 rounded-lg">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Default Address
                    </span>
                  )}
                </div>

                {/* Recipient Details */}
                <p className="font-semibold text-neutral-900 text-base tracking-tight">
                  {address.firstName} {address.lastName}
                </p>
                
                {/* Clean Descriptive Typography */}
                <address className="not-italic text-sm text-neutral-600 mt-2 space-y-1 leading-relaxed">
                  <p className="font-medium text-neutral-800">{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{address.city}, {address.state}</p>
                  <p className="text-xs font-medium text-neutral-400 tracking-wider uppercase mt-1">{address.country}</p>
                  {address.phone && (
                    <p className="text-xs font-medium text-neutral-500 pt-1 border-t border-neutral-100 mt-2 flex items-center gap-1">
                      <span className="text-neutral-400 font-normal">Phone:</span> {address.phone}
                    </p>
                  )}
                </address>
              </div>

              {/* Functional Dashboard Form Triggers */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-neutral-100">
                {!address.isDefault && (
                  <form action={setDefault} className="flex-1">
                    <input type="hidden" name="id" value={address.id} />
                    <input type="hidden" name="type" value={address.type} />
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="w-full text-xs font-medium border-neutral-200 hover:bg-neutral-50 rounded-xl transition-all h-9"
                    >
                      Set as Default
                    </Button>
                  </form>
                )}
                
                <form action={deleteAddress} className={address.isDefault ? "w-full" : ""}>
                  <input type="hidden" name="id" value={address.id} />
                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all h-9 px-3"
                    title="Delete saved address"
                  >
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