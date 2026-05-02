'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Star, CheckCircle, Clock, ShoppingBag, AlertCircle } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface ReviewFormProps {
  productId: string
  productName: string
}

type EligibilityState =
  | { status: 'loading' }
  | { status: 'not_logged_in' }
  | { status: 'not_purchased' }
  | { status: 'already_reviewed'; review: { rating: number; title?: string; content: string; isApproved: boolean } }
  | { status: 'eligible' }
  | { status: 'submitted' }

export function ReviewForm({ productId, productName }: ReviewFormProps) {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [eligibility, setEligibility] = useState<EligibilityState>({ status: 'loading' })
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (sessionStatus === 'loading') return

    if (!session?.user) {
      setEligibility({ status: 'not_logged_in' })
      return
    }

    fetch(`/api/reviews?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.eligible) {
          setEligibility({ status: 'eligible' })
        } else if (data.reason === 'not_purchased') {
          setEligibility({ status: 'not_purchased' })
        } else if (data.reason === 'already_reviewed') {
          setEligibility({ status: 'already_reviewed', review: data.existingReview })
        } else {
          setEligibility({ status: 'not_logged_in' })
        }
      })
      .catch(() => setEligibility({ status: 'not_logged_in' }))
  }, [session, sessionStatus, productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please select a star rating')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, content }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit review')
        return
      }

      setEligibility({ status: 'submitted' })
      toast.success('Review submitted! It will appear after admin approval.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── States ────────────────────────────────────────────────────────────────

  if (eligibility.status === 'loading') {
    return (
      <div className="border-t border-gray-100 pt-6 mt-6">
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (eligibility.status === 'not_logged_in') {
    return (
      <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
        <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Sign in to leave a review</p>
            <p className="text-sm text-gray-500 mt-0.5">
              You need to be signed in to review this product.
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="mt-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (eligibility.status === 'not_purchased') {
    return (
      <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
        <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
          <ShoppingBag className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Purchase required to review</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Only customers who have purchased this product can leave a review.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (eligibility.status === 'already_reviewed') {
    return (
      <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
          {eligibility.review.isApproved ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {eligibility.review.isApproved
                ? 'Your review is live'
                : 'Your review is pending approval'}
            </p>
            <div className="flex gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < eligibility.review.rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {eligibility.review.content && (
              <p className="text-sm text-gray-600 mt-1 italic">
                "{eligibility.review.content}"
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (eligibility.status === 'submitted') {
    return (
      <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
        <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-lg p-4">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Review submitted!</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Your review is awaiting approval and will appear shortly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Review form (eligible) ─────────────────────────────────────────────────
  return (
    <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
      <h4 className="font-semibold text-gray-900 mb-4">Write a Review</h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star rating picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hovered || rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-500 self-center">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-1">
            Review Title
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your experience"
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-1">
            Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Share your experience with ${productName}...`}
            rows={4}
            minLength={10}
            maxLength={2000}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {content.length}/2000
          </p>
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          Submit Review
        </Button>
      </form>
    </div>
  )
}