'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, Heart, MapPin, Star, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'

const NAV = [
  { href: '/account', label: 'Dashboard', icon: User, exact: true },
  { href: '/account/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/reviews', label: 'My Reviews', icon: Star },
  { href: '/account/profile', label: 'Profile', icon: User },
]

export function AccountSidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    useCart.getState().clearCart()
    await fetch('/api/auth/clear-order-token', { method: 'POST' })
    await signOut({ callbackUrl: '/' })
  }

  return (
    <aside className="lg:w-52 flex-shrink-0">
      <nav className="bg-white border border-gray-100 overflow-hidden">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium border-b border-gray-50 last:border-0 transition-colors ${
                active
                  ? 'bg-[#C9A84C]/6 text-[#111008] border-l-2 border-l-[#C9A84C]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-[#C9A84C]' : 'text-gray-400'}`} />
              {label}
            </Link>
          )
        })}
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-100">
          <LogOut className="h-4 w-4 flex-shrink-0" />Sign Out
        </button>
      </nav>
    </aside>
  )
}