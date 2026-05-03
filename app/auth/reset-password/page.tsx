'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/components/ui/Toast'
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'

// 1. Move all logic into an internal content component
function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ password: '', confirm: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to reset password'); return }
      setDone(true)
      setTimeout(() => router.push('/auth/signin?reset=true'), 2500)
    } catch { 
      toast.error('Connection error.')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600;700&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .anim-in { animation:fadeUp 0.55s ease both; }
      `}</style>

      <div className="min-h-screen bg-[#111008] hex-bg flex items-center justify-center px-6"
        style={{ fontFamily:"'Nunito',sans-serif" }}>
        <div className="w-full max-w-md anim-in">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-[#C9A84C]" />
              </div>
              <h1 className="font-display text-3xl text-white font-medium mb-3">Password updated!</h1>
              <p className="text-gray-400 text-sm">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center mb-8">
                <Lock className="h-5 w-5 text-[#C9A84C]" />
              </div>
              <h1 className="font-display text-3xl text-white font-medium mb-2">New Password</h1>
              <p className="text-gray-500 text-sm mb-8">Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { id: 'password', label: 'New Password', placeholder: 'At least 6 characters' },
                  { id: 'confirm', label: 'Confirm Password', placeholder: 'Repeat your password' },
                ].map(({ id, label, placeholder }) => (
                  <div key={id}>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
                    <div className="relative">
                      <input type={show ? 'text' : 'password'} placeholder={placeholder} required
                        value={(form as any)[id]} onChange={e => setForm({ ...form, [id]: e.target.value })}
                        className="w-full border py-3 px-4 pr-11 text-sm outline-none transition-colors"
                        style={{ background:'rgba(255,255,255,0.04)', color:'white', borderColor:'rgba(255,255,255,0.1)', fontFamily:"'Nunito',sans-serif" }}
                        onFocus={e=>e.currentTarget.style.borderColor='#C9A84C'} onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'} />
                      {id === 'password' && (
                        <button type="button" onClick={() => setShow(!show)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={loading}
                  className="w-full bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold py-4 transition-colors disabled:opacity-60">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
              <p className="mt-6 text-center">
                <Link href="/auth/signin" className="text-xs text-gray-600 hover:text-[#C9A84C] transition-colors">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// 2. Export the component wrapped in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#111008] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#C9A84C]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}