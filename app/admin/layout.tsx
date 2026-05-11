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
    <div className="flex min-h-screen bg-[#faf9f6]">
      <AdminSidebar user={{ name: session.user.name, email: session.user.email }} />

      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 lg:ml-64 min-w-0 transition-all duration-300">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 lg:px-10 py-4 flex items-center justify-between">
          {/* Spacer for mobile menu button (which is rendered in sidebar) */}
          <div className="lg:hidden w-10" /> 
          
          <div className="hidden lg:block">
            <h1 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
              Management Console
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#111008] leading-none">
                {session.user.name || 'Admin'}
              </p>
              <p className="text-[10px] text-[#C9A84C] font-semibold mt-1 uppercase tracking-wider">
                Authorized Access
              </p>
            </div>
            
            <div className="w-10 h-10 rounded-lg bg-[#111008] flex items-center justify-center text-[#C9A84C] text-sm font-bold flex-shrink-0 border border-white/10 shadow-lg">
              {(session.user.name ?? session.user.email ?? 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}