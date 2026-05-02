'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useCartItemCount, useCart } from '@/hooks/useCart'
import { ShoppingCart, Menu, X, User, ChevronDown, Heart, Package, LogOut, Settings, Search } from 'lucide-react'
import Image from 'next/image'

const NAV = [
  { label: 'Home',    href: '/' },
  { label: 'Shop',    href: '/shop' },
  { label: 'About',   href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const cartCount = useCartItemCount()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const isHero = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    useCart.getState().clearCart()
    await fetch('/api/auth/clear-order-token', { method: 'POST' })
    await signOut({ callbackUrl: '/' })
  }

  const headerBg = scrolled || !isHero
    ? 'bg-[#111008]/98 backdrop-blur-md shadow-lg shadow-black/20'
    : 'bg-transparent'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Nunito:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${headerBg}`}>
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Image src="/images/DurableHomesLogo.png" width={1000} height={1000} alt="Durable Homes Logo" />
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-xl text-white font-semibold tracking-wide leading-none block">
                  Durable Homes
                </span>
                <span className="text-[#C9A84C] text-[9px] tracking-[0.25em] uppercase leading-none">
                  Building Materials
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map(({ label, href }) => {
                const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                      active ? 'text-[#C9A84C]' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {label}
                    {active && (
                      <span className="absolute bottom-0 left-4 right-4 h-px bg-[#C9A84C]" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => router.push('/shop')}
                className="p-2 text-white/60 hover:text-white transition-colors hidden sm:flex"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-white/60 hover:text-[#C9A84C] transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C9A84C] text-[#111008] text-[10px] font-black rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              {session ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-2 p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <div className="w-7 h-7 bg-[#C9A84C]/20 border border-[#C9A84C]/30 rounded-full flex items-center justify-center">
                      <span className="text-[#C9A84C] text-xs font-bold">
                        {(session.user?.name ?? session.user?.email ?? 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1710] border border-[#C9A84C]/15 shadow-2xl z-20">
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-white text-sm font-medium truncate">{session.user?.name ?? 'Account'}</p>
                          <p className="text-gray-500 text-xs truncate">{session.user?.email}</p>
                        </div>
                        {[
                          { href: '/account', icon: User, label: 'My Account' },
                          { href: '/account/orders', icon: Package, label: 'Orders' },
                          { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
                          ...(session.user?.role === 'ADMIN' ? [{ href: '/admin/dashboard', icon: Settings, label: 'Admin Panel' }] : []),
                        ].map(({ href, icon: Icon, label }) => (
                          <Link key={href} href={href} onClick={() => setUserOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-[#C9A84C] hover:bg-white/3 transition-colors">
                            <Icon className="h-4 w-4" />{label}
                          </Link>
                        ))}
                        <button onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-colors border-t border-white/5">
                          <LogOut className="h-4 w-4" />Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/auth/signin"
                  className="hidden sm:inline-flex items-center gap-2 border border-[#C9A84C]/40 hover:border-[#C9A84C] text-[#C9A84C] text-sm font-semibold px-4 py-2 transition-all">
                  Sign In
                </Link>
              )}

              {/* Mobile toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white/70 hover:text-white transition-colors">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#111008] border-t border-white/5">
            <div className="container mx-auto px-6 py-4 space-y-1">
              {NAV.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === href ? 'text-[#C9A84C]' : 'text-white/70 hover:text-white'
                  }`}>
                  {label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5">
                {session ? (
                  <>
                    <Link href="/account" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-white/70 hover:text-white">My Account</Link>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-sm text-red-400">Sign Out</button>
                  </>
                ) : (
                  <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-[#C9A84C] font-semibold">Sign In</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}