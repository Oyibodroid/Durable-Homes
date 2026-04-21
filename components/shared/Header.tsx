'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import {
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  Home,
  Store,
  Info,
  Mail,
} from 'lucide-react'
import { useCart, useCartItemCount } from '@/hooks/useCart'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import AnimatedCounter from '@/components/ui/AnimatedCounter'


export function Header() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const itemCount = useCartItemCount()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/shop", icon: Store },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <Image src="/images/DurableHomesLogo.png" alt="Durable Homes Logo" width={50} height={50} />
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex lg:space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <div className="relative p-1">
                <ShoppingBag className="h-5 w-5 text-gray-700" />

                {/* Counter - shows when mounted and count > 0 */}
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User menu */}
            {session ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hover:bg-gray-100 transition-colors"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                </Button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50 py-1 animate-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {session.user.email}
                        </p>
                      </div>

                      {session.user.role === "ADMIN" && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3 text-gray-400" />
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/admin/products"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Package className="h-4 w-4 mr-3 text-gray-400" />
                            Manage Products
                          </Link>
                          <div className="border-t my-1" />
                        </>
                      )}

                      <Link
                        href="/account"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="h-4 w-4 mr-3 text-gray-400" />
                        My Orders
                      </Link>

                      <div className="border-t my-1" />

                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false)
                          useCart.getState().clearCart() 
                          await fetch('/api/auth/clear-order-token', { method: 'POST' })
                          await signOut({ redirect: true, callbackUrl: "/" })

                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t py-4 animate-in slide-in-from-top">
            <nav className="flex flex-col space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
              {session && (
                <>
                  <div className="border-t my-2" />
                  <Link
                    href="/account"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="h-4 w-4 mr-3" />
                    My Orders
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Admin Dashboard
                      </Link>
                      <Link
                        href="/admin/products"
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Package className="h-4 w-4 mr-3" />
                        Manage Products
                      </Link>
                    </>
                  )}
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false)
                      await signOut({ redirect: true, callbackUrl: "/" })
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-2"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Log Out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}