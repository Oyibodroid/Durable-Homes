import Link from 'next/link'
import { ArrowRight, Home, Search } from 'lucide-react'
import Image from 'next/image'

export default function NotFoundPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito:wght@300;400;500;600&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .anim-1 { animation:fadeUp 0.65s 0.05s ease both; }
        .anim-2 { animation:fadeUp 0.65s 0.15s ease both; }
        .anim-3 { animation:fadeUp 0.65s 0.28s ease both; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .animate-float { animation:float 5s ease-in-out infinite; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
      `}</style>

      <div className="min-h-screen bg-[#111008] hex-bg flex items-center justify-center px-6 relative overflow-hidden"
        style={{ fontFamily:"'Nunito',sans-serif" }}>

        {/* Background geometric shapes */}
        <div className="absolute top-20 right-[15%] w-32 h-32 border border-[#C9A84C]/10 rotate-45 animate-float hidden lg:block" style={{ animationDelay:'0s' }} />
        <div className="absolute bottom-32 left-[12%] w-20 h-20 border border-[#C9A84C]/08 -rotate-12 animate-float hidden lg:block" style={{ animationDelay:'1.5s' }} />
        <div className="absolute top-1/3 left-[8%] w-48 h-48 border border-[#C9A84C]/05 rotate-12 animate-float hidden lg:block" style={{ animationDelay:'0.8s' }} />

        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 50%,rgba(201,168,76,0.05) 0%,transparent 70%)' }} />

        <div className="text-center relative z-10 max-w-lg">
          {/* Big 404 */}
          <div className="anim-1 relative mb-6">
            <span className="font-display text-[10rem] lg:text-[14rem] font-semibold text-white/[0.04] select-none leading-none block">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className=" bg-[#C9A84C]/10  flex items-center justify-center">
                <Image src="/images/DurableHomesLogo.png" alt="Durable Homes Logo" width={1000} height={1000} className="w-20 h-20" />
              </div>
            </div>
          </div>

          <div className="anim-2">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-7 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Page Not Found</span>
              <span className="w-7 h-px bg-[#C9A84C]" />
            </div>
            <h1 className="font-display text-4xl lg:text-5xl text-white font-medium mb-4">
              This page doesn't exist
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
              The page you're looking for may have been moved, deleted, or never existed.
              Let's get you back on track.
            </p>
          </div>

          <div className="anim-3 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/"
              className="inline-flex items-center justify-center gap-3 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold px-8 py-4 transition-colors">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <Link href="/shop"
              className="inline-flex items-center justify-center gap-3 border border-[#C9A84C]/30 hover:border-[#C9A84C] text-[#C9A84C] font-semibold px-8 py-4 transition-all">
              <Search className="h-4 w-4" />
              Browse Shop
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}