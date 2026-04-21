'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string
  className?: string
  iconClassName?: string
  // Pass initialWishlisted if the parent already knows the state
  // (e.g. product detail page can check server-side)
  initialWishlisted?: boolean
}

export function WishlistButton({
  productId,
  className,
  iconClassName,
  initialWishlisted = false,
}: WishlistButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch actual wishlist state on mount if user is logged in
  useEffect(() => {
    if (status === 'loading' || !session?.user) return

    fetch('/api/wishlist')
      .then((res) => res.json())
      .then(({ items }) => {
        const isWishlisted = items.some(
          (item: { productId: string }) => item.productId === productId
        )
        setWishlisted(isWishlisted)
      })
      .catch(() => {})
  }, [session, status, productId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      toast.error('Please sign in to save items to your wishlist')
      router.push('/auth/signin')
      return
    }

    setIsLoading(true)
    const wasWishlisted = wishlisted

    // Optimistic update
    setWishlisted(!wasWishlisted)

    try {
      const res = await fetch('/api/wishlist', {
        method: wasWishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      if (!res.ok) throw new Error('Failed')

      toast.success(
        wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist'
      )
    } catch {
      // Revert on failure
      setWishlisted(wasWishlisted)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'transition-colors disabled:opacity-60',
        className
      )}
    >
      <Heart
        className={cn(
          'transition-colors',
          wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600',
          iconClassName
        )}
      />
    </button>
  )
}