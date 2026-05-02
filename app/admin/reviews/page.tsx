import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { Star, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

async function approveReview(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return
  await prisma.review.update({
    where: { id: formData.get('reviewId') as string },
    data: { isApproved: true },
  })
  revalidatePath('/admin/reviews')
}

async function rejectReview(formData: FormData) {
  'use server'
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') return
  await prisma.review.delete({ where: { id: formData.get('reviewId') as string } })
  revalidatePath('/admin/reviews')
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const { status: statusParam, page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const limit = 15
  const skip = (page - 1) * limit
  const showPending = !statusParam || statusParam === 'pending'

  const where =
    showPending ? { isApproved: false } :
    statusParam === 'approved' ? { isApproved: true } : {}

  const [reviews, total, pendingCount] = await Promise.all([
    prisma.review.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
    }),
    prisma.review.count({ where }),
    prisma.review.count({ where: { isApproved: false } }),
  ])

  const totalPages = Math.ceil(total / limit)
  const tabs = [
    { label: 'Pending', value: 'pending', count: pendingCount },
    { label: 'Approved', value: 'approved' },
    { label: 'All', value: 'all' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-1">
              {pendingCount} review{pendingCount !== 1 ? 's' : ''} awaiting approval
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const active = (statusParam ?? 'pending') === tab.value
          return (
            <Link key={tab.value}
              href={`/admin/reviews?status=${tab.value}`}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
                active
                  ? 'border-[#C9A84C] text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg p-16 text-center">
          <CheckCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            {showPending ? 'No reviews pending approval' : 'No reviews found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id}
              className={`bg-white border rounded-lg p-5 border-l-4 ${
                review.isApproved ? 'border-l-green-400' : 'border-l-amber-400'
              } border-gray-100`}>
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* Product + user */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Link href={`/shop/${review.product.slug}`} target="_blank"
                      className="font-semibold text-gray-900 hover:text-[#C9A84C] transition-colors text-sm">
                      {review.product.name}
                    </Link>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">
                      {review.user.name || review.user.email}
                    </span>
                    {review.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        <CheckCircle className="h-3 w-3" />Verified Purchase
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                      review.isApproved
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {review.isApproved
                        ? <><CheckCircle className="h-3 w-3" />Live</>
                        : <><Clock className="h-3 w-3" />Pending</>}
                    </span>
                  </div>

                  {/* Stars + date */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${
                          i < review.rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'
                        }`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-NG', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Content */}
                  {review.title && (
                    <p className="font-semibold text-sm text-gray-900 mb-1">{review.title}</p>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {review.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link href={`/shop/${review.product.slug}`} target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 transition-colors">
                    <Eye className="h-3.5 w-3.5" />View
                  </Link>

                  {!review.isApproved && (
                    <form action={approveReview}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <button type="submit"
                        className="w-full inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 transition-colors">
                        <CheckCircle className="h-3.5 w-3.5" />Approve
                      </button>
                    </form>
                  )}

                  <form action={rejectReview}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <button type="submit"
                      className="w-full inline-flex items-center gap-1.5 text-xs text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 transition-colors">
                      <XCircle className="h-3.5 w-3.5" />
                      {review.isApproved ? 'Remove' : 'Reject'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/admin/reviews?status=${statusParam ?? 'pending'}&page=${page - 1}`}
              className="px-4 py-2 border border-gray-200 text-sm text-gray-600 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
              ← Prev
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p}
              href={`/admin/reviews?status=${statusParam ?? 'pending'}&page=${p}`}
              className={`w-10 h-10 flex items-center justify-center text-sm transition-colors ${
                p === page
                  ? 'bg-[#C9A84C] text-[#111008] font-bold'
                  : 'border border-gray-200 text-gray-600 hover:border-[#C9A84C]'
              }`}>
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={`/admin/reviews?status=${statusParam ?? 'pending'}&page=${page + 1}`}
              className="px-4 py-2 border border-gray-200 text-sm text-gray-600 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}