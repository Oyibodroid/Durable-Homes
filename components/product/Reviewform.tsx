'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Star, CheckCircle, Clock, ShoppingBag, AlertCircle } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface ReviewFormProps {
  productId: string
  productName: string
}

type Eligibility =
  | { status: 'loading' }
  | { status: 'not_logged_in' }
  | { status: 'not_purchased' }
  | { status: 'already_reviewed'; review: { rating: number; title?: string | null; content: string; isApproved: boolean } }
  | { status: 'eligible' }
  | { status: 'submitted' }

export function ReviewForm({ productId, productName }: ReviewFormProps) {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [eligibility, setEligibility] = useState<Eligibility>({ status: 'loading' })
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (!session?.user) { setEligibility({ status: 'not_logged_in' }); return }
    fetch(`/api/reviews?productId=${productId}`)
      .then(r => r.json())
      .then(data => {
        if (data.eligible) setEligibility({ status: 'eligible' })
        else if (data.reason === 'not_purchased') setEligibility({ status: 'not_purchased' })
        else if (data.reason === 'already_reviewed') setEligibility({ status: 'already_reviewed', review: data.existingReview })
        else setEligibility({ status: 'not_logged_in' })
      })
      .catch(() => setEligibility({ status: 'not_logged_in' }))
  }, [session, sessionStatus, productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a star rating'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, content }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to submit review'); return }
      setEligibility({ status: 'submitted' })
    } catch { toast.error('Something went wrong.')
    } finally { setSubmitting(false) }
  }

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

  const inputClass = "w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors bg-white"

  if (eligibility.status === 'loading') return (
    <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
      <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
    </div>
  )

  if (eligibility.status === 'not_logged_in') return (
    <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
      <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 p-4">
        <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Sign in to leave a review</p>
          <button onClick={() => router.push('/auth/signin')} className="mt-1 text-sm text-[#C9A84C] font-semibold hover:underline">
            Sign in →
          </button>
        </div>
      </div>
    </div>
  )

  if (eligibility.status === 'not_purchased') return (
    <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
      <div className="flex items-start gap-3 bg-gray-50 border border-gray-100 p-4">
        <ShoppingBag className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Purchase required</p>
          <p className="text-xs text-gray-500 mt-0.5">Only customers who have purchased this product can review it.</p>
        </div>
      </div>
    </div>
  )

  if (eligibility.status === 'already_reviewed') return (
    <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4">
        {eligibility.review.isApproved
          ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          : <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />}
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {eligibility.review.isApproved ? 'Your review is live' : 'Review pending approval'}
          </p>
          <div className="flex gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < eligibility.review.rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'}`} />
            ))}
          </div>
          {eligibility.review.content && (
            <p className="text-xs text-gray-500 mt-1 italic">"{eligibility.review.content}"</p>
          )}
        </div>
      </div>
    </div>
  )

  if (eligibility.status === 'submitted') return (
    <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
      <div className="flex items-start gap-3 bg-green-50 border border-green-100 p-4">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Review submitted!</p>
          <p className="text-xs text-gray-500 mt-0.5">It will appear after admin approval.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div id="write-review" className="border-t border-gray-100 pt-6 mt-6">
      <h4 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
        <span className="w-4 h-px bg-[#C9A84C]" />Write a Review
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Rating <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button" onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}>
                <Star className={`h-7 w-7 transition-colors ${
                  s <= (hovered || rating) ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'
                }`} />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-500 font-medium">{LABELS[rating]}</span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Title</label>
          <input className={inputClass} placeholder="Summarise your experience" maxLength={100}
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Review <span className="text-red-500">*</span>
          </label>
          <textarea className={inputClass + ' resize-none'} rows={4} required minLength={10} maxLength={2000}
            placeholder={`Share your experience with ${productName}...`}
            value={content} onChange={e => setContent(e.target.value)} />
          <p className="text-xs text-gray-400 text-right mt-1">{content.length}/2000</p>
        </div>
        <button type="submit" disabled={submitting}
          className="inline-flex items-center gap-2 bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008] font-bold px-8 py-3 transition-all disabled:opacity-60">
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}