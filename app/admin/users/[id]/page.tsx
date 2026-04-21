import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ShoppingBag, Star, MapPin, CheckCircle, Clock } from 'lucide-react'

async function updateUserRole(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return
  const id = formData.get('id') as string
  const role = formData.get('role') as 'USER' | 'ADMIN' | 'MANAGER'
  if (id === session.user.id) return // Prevent self-demotion
  await prisma.user.update({ where: { id }, data: { role } })
  revalidatePath(`/admin/users/${id}`)
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true } } },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true, slug: true } } },
      },
      addresses: { take: 3 },
      _count: { select: { orders: true, reviews: true, addresses: true, wishlist: true } },
    },
  })

  if (!user) notFound()

  const totalSpent = await prisma.order.aggregate({
    where: { userId: id, paymentStatus: 'COMPLETED' },
    _sum: { total: true },
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                {(user.name ?? user.email ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-lg">{user.name ?? 'No name'}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Role</dt>
                <dd>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email verified</dt>
                <dd>{user.emailVerified ? <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />Verified</span> : <span className="text-amber-600 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Pending</span>}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd>{user.phone ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Joined</dt>
                <dd>{new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Total spent</dt>
                <dd className="font-semibold">₦{Number(totalSpent._sum.total ?? 0).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Orders', value: user._count.orders, icon: ShoppingBag },
              { label: 'Reviews', value: user._count.reviews, icon: Star },
              { label: 'Addresses', value: user._count.addresses, icon: MapPin },
              { label: 'Wishlist', value: user._count.wishlist, icon: Star },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white rounded-lg shadow p-4 text-center">
                  <Icon className="h-5 w-5 mx-auto mb-1 text-gray-400" />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {/* Change Role */}
          {id !== session.user.id && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3">Change Role</h3>
              <form action={updateUserRole}>
                <input type="hidden" name="id" value={user.id} />
                <select name="role" defaultValue={user.role} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                  <option value="USER">User</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white" size="sm">Update Role</Button>
              </form>
            </div>
          )}
        </div>

        {/* Orders & Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gray-400" />
              Recent Orders
            </h3>
            {user.orders.length > 0 ? (
              <div className="space-y-3">
                {user.orders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div>
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order._count.items} items · {new Date(order.createdAt).toLocaleDateString('en-NG')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₦{Number(order.total).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No orders yet</p>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 text-gray-400" />
              Recent Reviews
            </h3>
            {user.reviews.length > 0 ? (
              <div className="space-y-3">
                {user.reviews.map((review) => (
                  <div key={review.id} className="p-3 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start">
                      <Link href={`/shop/${review.product.slug}`} className="font-medium text-sm hover:text-yellow-600">{review.product.name}</Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${review.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex gap-0.5 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    {review.content && <p className="text-xs text-gray-600 line-clamp-2">{review.content}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            )}
          </div>

          {/* Addresses */}
          {user.addresses.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                Addresses
              </h3>
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div key={addr.id} className="p-3 rounded-lg border border-gray-100 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{addr.firstName} {addr.lastName}</p>
                    <p>{addr.addressLine1}, {addr.city}, {addr.state}</p>
                    {addr.phone && <p>{addr.phone}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}