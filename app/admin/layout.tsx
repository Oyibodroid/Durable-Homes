import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={{ name: session.user.name, email: session.user.email }} />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="lg:hidden" /> {/* spacer for mobile menu button (in sidebar) */}
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {(session.user.name ?? session.user.email ?? 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}