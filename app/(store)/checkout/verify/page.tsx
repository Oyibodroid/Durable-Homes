'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * /checkout/verify
 *
 * Paystack redirects the user here after payment with:
 * ?trxref=PS-xxx&reference=PS-xxx
 */

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const reference = searchParams.get('reference')

    if (!reference) {
      router.replace('/cart?error=missing_reference')
      return
    }

    // Hand off to the API route which does all the DB work
    // Using window.location so the API route can issue a redirect response
    window.location.href = `/api/payments/verify?reference=${reference}`
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Verifying your payment...
        </h2>
        <p className="text-sm text-gray-500">
          Please don't close this page
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}