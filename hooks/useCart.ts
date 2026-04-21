'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  images?: { url: string }[] | string[] | null
  category?: { name: string } | null
  sku?: string
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isLoading: boolean
  addItem: (product: any, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

/**
 * Fires a background sync to the database.
 * Never throws — if it fails, the local cart is unaffected.
 */
async function syncToDatabase(items: CartItem[]) {
  try {
    await fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
  } catch (error) {
    console.error('Background cart sync failed:', error)
  }
}

/**
 * Returns true if the user is currently logged in by checking
 * the NextAuth session — works outside of React components.
 */
async function isLoggedIn(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/session')
    if (!res.ok) return false
    const session = await res.json()
    return !!session?.user
  } catch {
    return false
  }
}

/**
 * Syncs to DB only when the user is logged in.
 * Runs in the background — never blocks the UI update.
 */
async function maybeSync(items: CartItem[]) {
  const loggedIn = await isLoggedIn()
  if (loggedIn) {
    await syncToDatabase(items)
  }
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: (product, quantity) => {
        try {
          const currentItems = get().items ?? []
          const existingItem = currentItems.find(
            (item) => item?.product?.id === product.id
          )

          const cartProduct: CartProduct = {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price) || 0,
            quantity: product.quantity || 0,
            images: product.images || [],
            category: product.category || null,
            sku: product.sku,
          }

          let newItems: CartItem[]
          if (existingItem) {
            newItems = currentItems.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          } else {
            newItems = [...currentItems, { product: cartProduct, quantity }]
          }

          // Update Zustand + localStorage immediately
          set({ items: newItems })

          // Sync to DB in background if logged in
          maybeSync(newItems)
        } catch (error) {
          console.error('Error adding item to cart:', error)
        }
      },

      removeItem: (productId) => {
        try {
          const newItems = (get().items ?? []).filter(
            (item) => item.product.id !== productId
          )
          set({ items: newItems })
          maybeSync(newItems)
        } catch (error) {
          console.error('Error removing item from cart:', error)
        }
      },

      updateQuantity: (productId, quantity) => {
        try {
          const state = get()

          if (quantity < 1) {
            state.removeItem(productId)
            return
          }

          const newItems = (state.items ?? []).map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
          set({ items: newItems })
          maybeSync(newItems)
        } catch (error) {
          console.error('Error updating quantity:', error)
        }
      },

      clearCart: () => {
        set({ items: [] })
        // Clear DB cart too if logged in
        maybeSync([])
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)

// ── Selector hooks ────────────────────────────────────────────────────────────

export const useCartItemCount = () =>
  useCart((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  )

export const useCartSubtotal = () =>
  useCart((state) =>
    state.items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0
    )
  )

export const useCartItems = () => useCart((state) => state.items)