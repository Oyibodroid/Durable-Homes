'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useCart } from '@/hooks/useCart'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Star,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Percent,
  Store
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Discounts', href: '/admin/discounts', icon: Percent },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    useCart.getState().clearCart()
    await fetch('/api/auth/clear-order-token', { method: 'POST' })
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111008] border-r border-white/5">
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-white/5">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-white/5 rounded-lg p-2 group-hover:bg-white/10 transition-colors">
            <Image 
              src="/images/DurableHomesLogo.png" 
              alt="Logo" 
              width={40} 
              height={40} 
              className="object-contain"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-display text-lg font-semibold leading-none tracking-tight">Durable Homes</p>
            <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.2em] mt-1.5 font-bold">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-[#C9A84C] text-[#111008]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-[#111008]' : 'text-gray-500 group-hover:text-[#C9A84C]')} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <div className="absolute right-2 w-1 h-4 bg-[#111008]/20 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-black/20">

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-gray-400 hover:bg-white/5 hover:text-[#C9A84C] transition-all"
          onClick={() => setMobileOpen(false)}
        >
          <Store className="h-4 w-4" />
          Back to store
        </Link>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 z-40 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#111008] text-[#C9A84C] rounded-lg border border-white/10 shadow-xl"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-[-50px] p-2 bg-[#C9A84C] text-[#111008] rounded-full shadow-lg"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}