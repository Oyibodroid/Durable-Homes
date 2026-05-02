'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'

const SYNC_KEY = 'cart_synced_session'
const POLL_INTERVAL = 20000 // 20 seconds

/**
 * CartProvider
 *
 * 1. On login — merges localStorage guest cart with DB cart (once per session)
 * 2. While logged in — polls the DB every 30 seconds and updates Zustand
 *    if the server has a different cart (handles cross-device updates)
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      sessionStorage.removeItem(SYNC_KEY)
      stopPolling()
      return
    }

    // Run merge once per login session
    if (sessionStorage.getItem(SYNC_KEY) !== session.user.id) {
      mergeCartsOnLogin()
    }

    // Start polling for cross-device updates
    startPolling()

    return () => stopPolling()
  }, [session?.user?.id, status])

  function startPolling() {
    stopPolling() // Clear any existing interval first
    pollRef.current = setInterval(pollCart, POLL_INTERVAL)
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  async function pollCart() {
    try {
      const res = await fetch('/api/cart')
      if (!res.ok) return

      const { items: dbItems } = await res.json()

      if (!dbItems || !Array.isArray(dbItems)) return

      const localItems = useCart.getState().items

      // Only update if the DB cart differs from local
      // Compare by stringifying — avoids unnecessary re-renders
      const dbSummary = JSON.stringify(
        dbItems
          .map((i: any) => ({ id: i.product.id, qty: i.quantity }))
          .sort((a: any, b: any) => a.id.localeCompare(b.id))
      )
      const localSummary = JSON.stringify(
        localItems
          .map((i) => ({ id: i.product.id, qty: i.quantity }))
          .sort((a, b) => a.id.localeCompare(b.id))
      )

      if (dbSummary !== localSummary) {
        useCart.setState({ items: dbItems })
      }
    } catch (error) {
      // Fail silently — polling is best-effort
    }
  }

  async function mergeCartsOnLogin() {
    try {
      const localItems = useCart.getState().items

      const res = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: localItems }),
      })

      if (!res.ok) throw new Error('Failed to merge cart')

      const { items: mergedItems } = await res.json()

      useCart.setState({ items: mergedItems })

      sessionStorage.setItem(SYNC_KEY, session!.user!.id!)
    } catch (error) {
      console.error('Cart merge error:', error)
    }
  }

  return <>{children}</>
}