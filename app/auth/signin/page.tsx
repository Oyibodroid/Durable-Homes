'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from '@/components/ui/Toast'
import { Mail, CheckCircle, RefreshCw, ArrowRight, Eye, EyeOff } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google'|null>(null)
  const [resending, setResending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email:'', password:'' })
  const [unverifiedEmail, setUnverifiedEmail] = useState<string|null>(null)

  const verified = searchParams.get('verified')
  const errorParam = searchParams.get('error')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
    if (unverifiedEmail) setUnverifiedEmail(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setUnverifiedEmail(null)
    try {
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (result?.error) {
        const check = await fetch('/api/auth/check-verification', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ email: form.email }),
        })
        const { verified: isVerified, exists } = await check.json()
        if (exists && !isVerified) { setUnverifiedEmail(form.email) }
        else { toast.error('Invalid email or password') }
        return
      }
      toast.success('Welcome back!')
      router.push('/'); router.refresh()
    } catch { toast.error('Connection error. Please try again.')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (!unverifiedEmail) return; setResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: unverifiedEmail }),
      })
      if (res.ok) { toast.success('Verification email sent!'); setUnverifiedEmail(null) }
      else { toast.error('Failed to resend. Try again.') }
    } catch { toast.error('Connection error.')
    } finally { setResending(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600;700&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .anim-in { animation:fadeUp 0.55s ease both; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
        .field { width:100%; border:1.5px solid #e5e4e0; padding:12px 14px; font-size:14px; font-family:'Nunito',sans-serif; outline:none; transition:border-color 0.2s; background:white; color:#111; }
        .field:focus { border-color:#C9A84C; }
        .field::placeholder { color:#9ca3af; }
      `}</style>

      <div className="min-h-screen bg-[#111008] hex-bg flex" style={{ fontFamily:"'Nunito',sans-serif" }}>
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 border-r border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image src="/images/DurableHomesLogo.png" alt="Durable Homes Logo" className="w-full" width={1000} height={1000}/>
            </div>
            <span className="font-display text-xl text-white font-semibold">Durable Homes</span>
          </Link>
          <div>
            <p className="font-display text-5xl text-white font-medium leading-tight mb-4">
              Welcome<br />back.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Sign in to manage your orders, track deliveries, and access your saved items.
            </p>
          </div>
          <div className="flex gap-4">
            {['4.8★ Rated', 'ISO Certified', '12+ Cities'].map(t => (
              <div key={t} className="border border-white/10 px-3 py-2 text-xs text-gray-500">{t}</div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md anim-in">

            {/* Mobile logo */}
            <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
              <div className="w-8 h-8 bg-[#C9A84C] flex items-center justify-center">
                <span className="text-[#111008] font-black text-sm">DH</span>
              </div>
              <span className="font-display text-xl text-white font-semibold">Durable Homes</span>
            </Link>

            <h1 className="font-display text-3xl text-white font-medium mb-1">Sign In</h1>
            <p className="text-gray-500 text-sm mb-8">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-[#C9A84C] font-semibold hover:underline">Create one</Link>
            </p>

            {/* Banners */}
            {verified && (
              <div className="flex items-center gap-3 bg-green-900/30 border border-green-700/40 px-4 py-3 mb-6">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <p className="text-green-300 text-sm">Email verified! You can now sign in.</p>
              </div>
            )}
            {unverifiedEmail && (
              <div className="bg-amber-900/20 border border-amber-700/30 px-4 py-3 mb-6">
                <p className="text-amber-300 text-sm font-medium mb-1">Email not verified</p>
                <p className="text-amber-400/80 text-xs mb-2">Check your inbox for <strong>{unverifiedEmail}</strong></p>
                <button onClick={handleResend} disabled={resending}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold hover:underline disabled:opacity-60">
                  <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <input id="email" type="email" className="field" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required autoComplete="email" style={{ background:'rgba(255,255,255,0.04)', color:'white', borderColor:'rgba(255,255,255,0.1)' }}
                  onFocus={e=>e.currentTarget.style.borderColor='#C9A84C'} onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} className="field pr-11"
                    placeholder="••••••••" value={form.password} onChange={handleChange} required autoComplete="current-password"
                    style={{ background:'rgba(255,255,255,0.04)', color:'white', borderColor:'rgba(255,255,255,0.1)' }}
                    onFocus={e=>e.currentTarget.style.borderColor='#C9A84C'} onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold py-4 transition-colors disabled:opacity-60 mt-2">
                {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}