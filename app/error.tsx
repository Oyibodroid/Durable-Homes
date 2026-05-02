'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600;700&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
      `}</style>

      <div className="min-h-screen bg-[#111008] hex-bg flex items-center justify-center px-6"
        style={{ fontFamily:"'Nunito',sans-serif" }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-900/30 border border-red-700/40 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="font-display text-4xl text-white font-medium mb-3">
            Something went wrong
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-10">
            An unexpected error occurred. Our team has been notified.
            {error.digest && <span className="block mt-2 text-xs text-gray-700">Error ID: {error.digest}</span>}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={reset}
              className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold px-6 py-3.5 transition-colors">
              <RefreshCw className="h-4 w-4" />Try Again
            </button>
            <Link href="/"
              className="inline-flex items-center justify-center gap-2 border border-[#C9A84C]/30 hover:border-[#C9A84C] text-[#C9A84C] font-semibold px-6 py-3.5 transition-all">
              <Home className="h-4 w-4" />Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}