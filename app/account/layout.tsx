import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AccountSidebar } from '@/components/account/AccountSidebar'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
      `}</style>

      <div className="min-h-screen bg-[#faf9f6]" style={{ fontFamily:"'Nunito',sans-serif", paddingTop:'80px' }}>
        {/* Header */}
        <div className="bg-[#111008] hex-bg py-10">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-7 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">My Account</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center">
                <span className="text-[#C9A84C] font-bold text-lg">
                  {(session.user?.name ?? session.user?.email ?? 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-display text-2xl text-white font-medium">
                  {session.user?.name ?? 'My Account'}
                </p>
                <p className="text-gray-500 text-sm">{session.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 lg:px-12 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <AccountSidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </>
  )
}