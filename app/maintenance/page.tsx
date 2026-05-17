import { getSetting } from '@/lib/settings'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, Clock } from 'lucide-react'

export default async function MaintenancePage() {
  const message = await getSetting('maintenanceMessage')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .hex-bg {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E");
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes shimmer {
          0% { background-position: 200% center }
          100% { background-position: -200% center }
        }
        .anim-1 { animation: fadeUp 0.6s 0.05s ease both; }
        .anim-2 { animation: fadeUp 0.6s 0.15s ease both; }
        .anim-3 { animation: fadeUp 0.6s 0.28s ease both; }
        .anim-4 { animation: fadeUp 0.6s 0.42s ease both; }
        .animate-float-1 { animation: float 6s 0s ease-in-out infinite; }
        .animate-float-2 { animation: float 5s 1.5s ease-in-out infinite; }
        .animate-float-3 { animation: float 7s 0.8s ease-in-out infinite; }
        .gold-shimmer {
          background: linear-gradient(90deg, #C9A84C 0%, #f0d080 40%, #C9A84C 60%, #f0d080 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div
        className="min-h-screen bg-[#111008] hex-bg flex items-center justify-center px-6 relative overflow-hidden"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Floating geometric shapes */}
        <div className="absolute top-16 left-[10%] w-28 h-28 border border-[#C9A84C]/10 rotate-45 animate-float-1 hidden lg:block" />
        <div className="absolute bottom-24 right-[12%] w-20 h-20 border border-[#C9A84C]/08 -rotate-12 animate-float-2 hidden lg:block" />
        <div className="absolute top-1/3 right-[8%] w-44 h-44 border border-[#C9A84C]/06 rotate-12 animate-float-3 hidden lg:block" />
        <div className="absolute bottom-16 left-[18%] w-12 h-12 border border-[#C9A84C]/12 rotate-45 animate-float-2 hidden lg:block" />

        {/* Gold vertical accent line */}
        <div className="absolute left-[6%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/20 to-transparent hidden xl:block" />

        <div className="relative z-10 text-center max-w-lg w-full">

          {/* Logo */}
          <div className="anim-1 flex items-center justify-center mb-10">
            <div className="relative w-40 h-20">
              <Image
                src="/images/DurableHomesLogo.png"
                alt="Durable Homes"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Gold divider */}
          <div className="anim-2 flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-[#C9A84C]/40" />
            <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase font-semibold">
              Scheduled Maintenance
            </span>
            <div className="h-px w-12 bg-[#C9A84C]/40" />
          </div>

          {/* Headline */}
          <h1 className="anim-2 font-display text-5xl lg:text-6xl font-medium leading-tight mb-6">
            <span className="text-white block">We'll be back</span>
            <span className="gold-shimmer block">shortly.</span>
          </h1>

          {/* Message */}
          <p className="anim-3 text-gray-400 leading-relaxed text-[15px] max-w-md mx-auto mb-10">
            {message}
          </p>

          {/* Status indicator */}
          <div className="anim-3 inline-flex items-center gap-2 bg-white/4 border border-white/8 px-5 py-3 mb-10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
            </span>
            <span className="text-gray-400 text-sm">Maintenance in progress</span>
          </div>

          {/* Contact cards */}
          <div className="anim-4 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            <a
              href="mailto:sales@durablehomes.com"
              className="flex flex-col items-center gap-2 border border-white/8 hover:border-[#C9A84C]/40 p-4 transition-all group"
            >
              <Mail className="h-5 w-5 text-[#C9A84C] group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-xs text-gray-300 group-hover:text-[#C9A84C] transition-colors">
                  sales@durablehomes.com
                </p>
              </div>
            </a>
            <a
              href="tel:+2341234567890"
              className="flex flex-col items-center gap-2 border border-white/8 hover:border-[#C9A84C]/40 p-4 transition-all group"
            >
              <Phone className="h-5 w-5 text-[#C9A84C] group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Phone</p>
                <p className="text-xs text-gray-300 group-hover:text-[#C9A84C] transition-colors">
                  +234 123 456 7890
                </p>
              </div>
            </a>
            <div className="flex flex-col items-center gap-2 border border-white/8 p-4">
              <Clock className="h-5 w-5 text-[#C9A84C]" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Hours</p>
                <p className="text-xs text-gray-300">Mon–Fri 8am–6pm</p>
              </div>
            </div>
          </div>

          {/* Bottom copyright */}
          <p className="text-gray-700 text-xs">
            © {new Date().getFullYear()} Durable Homes · Building Materials & Interiors
          </p>
        </div>
      </div>
    </>
  )
}