'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { Mail, Phone, MapPin, Clock, Send, ArrowRight, MessageSquare, HardHat } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    toast.success("Message received! We'll respond within 2 hours.")
    setForm({ name:'', email:'', phone:'', subject:'', message:'' })
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito:wght@300;400;500;600&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .anim-1 { animation:fadeUp 0.65s 0.05s ease both; }
        .anim-2 { animation:fadeUp 0.65s 0.15s ease both; }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .gold-shimmer {
          background:linear-gradient(90deg,#C9A84C 0%,#f0d080 40%,#C9A84C 60%,#f0d080 100%);
          background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 3s linear infinite;
        }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
        .field { width:100%; border:1.5px solid #e5e4e0; padding:12px 14px; font-size:14px; font-family:'Nunito',sans-serif; outline:none; transition:border-color 0.2s; background:white; color:#111; }
        .field:focus { border-color:#C9A84C; }
        .field::placeholder { color:#9ca3af; }
      `}</style>

      <div className="min-h-screen bg-white" style={{ fontFamily:"'Nunito',sans-serif", paddingTop:'80px' }}>

        {/* Hero */}
        <section className="bg-[#111008] hex-bg pt-20 pb-20 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 70% 60% at 70% 50%,rgba(201,168,76,0.07) 0%,transparent 70%)' }} />
          <div className="absolute top-12 right-[14%] w-24 h-24 border border-[#C9A84C]/12 rotate-45 hidden lg:block" />
          <div className="absolute bottom-16 right-[30%] w-14 h-14 border border-[#C9A84C]/10 -rotate-12 hidden lg:block" />

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-2xl">
              <div className="anim-1 flex items-center gap-3 mb-6">
                <span className="w-7 h-px bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Get in Touch</span>
              </div>
              <h1 className="anim-2 font-display text-5xl lg:text-6xl font-medium leading-tight mb-5">
                <span className="text-white">Let's Talk</span><br />
                <span className="gold-shimmer">About Your Project</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-lg">
                Whether you need a quick quote or expert advice on materials for your build,
                our team is ready to help.
              </p>
            </div>
          </div>
        </section>

        {/* Quick info strip */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
              {[
                { icon: Phone, label: 'Call Us', value: '+234 123 456 7890', href: 'tel:+2341234567890' },
                { icon: Mail, label: 'Email', value: 'sales@durablehomes.com', href: 'mailto:sales@durablehomes.com' },
                { icon: Clock, label: 'Hours', value: 'Mon–Fri 8am–6pm', href: null },
                { icon: MapPin, label: 'Location', value: 'Ikeja, Lagos', href: null },
              ].map(({ icon: Icon, label, value, href }) => {
                const content = (
                  <div className="flex items-center gap-3 py-5 px-4">
                    <div className="w-9 h-9 bg-[#C9A84C]/8 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-[#C9A84C]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                    </div>
                  </div>
                )
                return href ? (
                  <a key={label} href={href} className="hover:bg-[#C9A84C]/3 transition-colors block">{content}</a>
                ) : (
                  <div key={label}>{content}</div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <section className="py-20">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

              {/* Left sidebar */}
              <div className="lg:col-span-2 space-y-6">

                {/* Bulk orders */}
                <div className="bg-[#111008] p-7 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-[#C9A84C]/15" />
                  <HardHat className="h-8 w-8 text-[#C9A84C] mb-4" />
                  <h3 className="font-display text-2xl text-white mb-2">Bulk Orders</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-5">
                    Building at scale? We offer custom pricing and dedicated account management for contractors handling large projects.
                  </p>
                  <a href="mailto:bulk@durablehomes.com"
                    className="inline-flex items-center gap-2 text-[#C9A84C] text-sm font-semibold hover:gap-3 transition-all">
                    Email our sales team <ArrowRight className="h-4 w-4" />
                  </a>
                </div>

                {/* FAQ quick links */}
                <div className="border border-gray-100 p-7">
                  <div className="flex items-center gap-2 mb-5">
                    <MessageSquare className="h-4 w-4 text-[#C9A84C]" />
                    <h3 className="font-semibold text-gray-900">Common Questions</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Do you deliver outside Lagos?',
                      'What is the minimum order size?',
                      'Can I get a product specification sheet?',
                      'What payment methods do you accept?',
                    ].map((q) => (
                      <li key={q}>
                        <a href="#form" className="flex items-start gap-2 text-sm text-gray-600 hover:text-[#C9A84C] transition-colors">
                          <span className="text-[#C9A84C] mt-0.5 flex-shrink-0">→</span>{q}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-3" id="form">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-px bg-[#C9A84C]" />
                  <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Message Us</span>
                </div>
                <h2 className="font-display text-3xl lg:text-4xl font-medium text-gray-900 mb-8">
                  Send a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
                      <input className="field" placeholder="John Doe" value={form.name} onChange={e=>set('name',e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email *</label>
                      <input className="field" type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                      <input className="field" type="tel" placeholder="+234 000 000 0000" value={form.phone} onChange={e=>set('phone',e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject *</label>
                      <select className="field" value={form.subject} onChange={e=>set('subject',e.target.value)} required>
                        <option value="">Select a subject</option>
                        <option value="product">Product Inquiry</option>
                        <option value="bulk">Bulk Order / Quote</option>
                        <option value="order">Order Support</option>
                        <option value="delivery">Delivery Question</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message *</label>
                    <textarea className="field resize-none" rows={5} placeholder="Tell us how we can help..." value={form.message} onChange={e=>set('message',e.target.value)} required />
                  </div>

                  <button type="submit" disabled={loading}
                    className="inline-flex items-center gap-3 bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008] font-bold px-10 py-4 transition-all duration-300 disabled:opacity-60">
                    {loading ? 'Sending...' : <><Send className="h-4 w-4" /> Send Message</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}