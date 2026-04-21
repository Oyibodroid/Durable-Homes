'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { Toaster } from 'sonner'

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // No header/footer on admin or auth routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/auth')
  const showStoreLayout = !isAdminRoute && !isAuthRoute

  if (!showStoreLayout) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="light"
        duration={4000}
        toastOptions={{
          className: 'font-sans text-sm',
          style: { borderLeft: '4px solid #EAB308' },
        }}
      />
      <Footer />
    </>
  )
}