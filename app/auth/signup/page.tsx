'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from '@/components/ui/Toast'
import { ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'

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

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', password:'' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.id]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Registration failed'); return }
      setSubmitted(true)
    } catch { toast.error('Connection error. Please try again.')
    } finally { setLoading(false) }
  }

  if (submitted) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600;700&display=swap'); .font-display{font-family:'Cormorant Garamond',serif;}`}</style>
        <div className="min-h-screen bg-[#111008] flex items-center justify-center px-6" style={{ fontFamily:"'Nunito',sans-serif" }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-[#C9A84C]/15 border border-[#C9A84C]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-[#C9A84C]" />
            </div>
            <h1 className="font-display text-4xl text-white font-medium mb-3">Check your inbox</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              We sent a verification link to <strong className="text-white">{form.email}</strong>.<br />
              Click it to activate your account.
            </p>
            <Link href="/auth/signin" className="inline-flex items-center gap-2 text-[#C9A84C] font-semibold hover:underline text-sm">
              Back to Sign In <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600;700&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .anim-in { animation:fadeUp 0.55s ease both; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
      `}</style>

      <div className="min-h-screen bg-[#111008] hex-bg flex" style={{ fontFamily:"'Nunito',sans-serif" }}>
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 border-r border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] flex items-center justify-center">
              <span className="text-[#111008] font-black text-sm">DH</span>
            </div>
            <span className="font-display text-xl text-white font-semibold">Durable Homes</span>
          </Link>
          <div>
            <p className="font-display text-5xl text-white font-medium leading-tight mb-4">
              Start<br />building<br />today.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Join thousands of contractors and homeowners who trust Durable Homes for their building materials.
            </p>
            <ul className="mt-6 space-y-2">
              {['Access to 500+ products', 'Track orders in real time', 'Exclusive bulk discounts', 'Expert technical support'].map(item => (
                <li key={item} className="flex items-center gap-2 text-gray-500 text-sm">
                  <CheckCircle className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-gray-700 text-xs">© {new Date().getFullYear()} Durable Homes</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md anim-in">
            <Link href="/" className="flex items-center gap-3 mb-10 lg:hidden">
              <div className="w-8 h-8 bg-[#C9A84C] flex items-center justify-center">
                <span className="text-[#111008] font-black text-sm">DH</span>
              </div>
              <span className="font-display text-xl text-white font-semibold">Durable Homes</span>
            </Link>

            <h1 className="font-display text-3xl text-white font-medium mb-1">Create Account</h1>
            <p className="text-gray-500 text-sm mb-8">
              Already have one?{' '}
              <Link href="/auth/signin" className="text-[#C9A84C] font-semibold hover:underline">Sign in</Link>
            </p>

            {/* Google */}
            <button onClick={() => signIn('google', { callbackUrl:'/' })}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm py-3.5 mb-6 transition-colors border border-gray-200">
              <GoogleIcon />Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-600 text-xs">or create with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id:'name', label:'Full Name', type:'text', placeholder:'John Doe' },
                { id:'email', label:'Email', type:'email', placeholder:'you@example.com' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
                  <input id={id} type={type} placeholder={placeholder} required
                    value={(form as any)[id]} onChange={handleChange}
                    className="w-full border py-3 px-4 text-sm outline-none transition-colors"
                    style={{ background:'rgba(255,255,255,0.04)', color:'white', borderColor:'rgba(255,255,255,0.1)', fontFamily:"'Nunito',sans-serif" }}
                    onFocus={e=>e.currentTarget.style.borderColor='#C9A84C'} onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} placeholder="At least 6 characters" required
                    value={form.password} onChange={handleChange}
                    className="w-full border py-3 px-4 pr-11 text-sm outline-none transition-colors"
                    style={{ background:'rgba(255,255,255,0.04)', color:'white', borderColor:'rgba(255,255,255,0.1)', fontFamily:"'Nunito',sans-serif" }}
                    onFocus={e=>e.currentTarget.style.borderColor='#C9A84C'} onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-600">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-[#C9A84C] hover:underline">Terms</Link> and{' '}
                <Link href="/privacy" className="text-[#C9A84C] hover:underline">Privacy Policy</Link>.
              </p>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold py-4 transition-colors disabled:opacity-60 mt-2">
                {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}