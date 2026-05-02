import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Star, Clock, CheckCircle, Package } from 'lucide-react'

export default async function AccountReviewsPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: { product: { select: { name: true, slug: true, images: { where: { isMain: true }, take: 1 } } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Reviews</h1>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Star className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-medium text-gray-700 mb-2">No reviews yet</h2>
          <p className="text-gray-500 text-sm mb-4">Reviews you leave on products you've purchased will appear here.</p>
          <Link href="/shop" className="text-yellow-600 hover:underline text-sm font-medium">Browse products →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link href={`/shop/${review.product.slug}`} className="font-semibold text-gray-900 hover:text-yellow-600">
                    {review.product.name}
                  </Link>
                  <div className="flex gap-0.5 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {review.title && <p className="font-medium text-sm text-gray-900 mb-1">{review.title}</p>}
                  <p className="text-sm text-gray-600">{review.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0 ${review.isApproved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {review.isApproved ? <><CheckCircle className="h-3 w-3" />Live</> : <><Clock className="h-3 w-3" />Pending</>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}