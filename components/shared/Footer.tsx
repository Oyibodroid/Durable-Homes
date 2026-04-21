'use client'

import Link from 'next/link'
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Truck,
  Shield,
  Clock,
  ChevronRight,
  Send,
  Package,
  HardHat,
  Award,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { useState } from 'react'

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentYear = new Date().getFullYear()

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      toast.success('Subscribed! Check your email for updates.')
      setEmail('')
      setIsSubmitting(false)
    }, 800)
  }

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/shop' },
      { name: 'Structural Materials', href: '/shop?category=structural' },
      { name: 'Interior Finishes', href: '/shop?category=finishes' },
      { name: 'Flooring & Tiles', href: '/shop?category=flooring' },
      { name: 'Fixtures & Fittings', href: '/shop?category=fixtures' },
      { name: 'Tools & Equipment', href: '/shop?category=tools' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
    ],
    account: [
      { name: 'My Account', href: '/account' },
      { name: 'My Orders', href: '/account/orders' },
      { name: 'Wishlist', href: '/account/wishlist' },
      { name: 'Sign In', href: '/auth/signin' },
    ],
    legal: [
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  }

  const certifications = [
    { name: 'ISO 9001', icon: Award, color: 'text-blue-400' },
    { name: 'SON Certified', icon: Shield, color: 'text-green-400' },
    { name: 'Quality Assured', icon: CheckCircle, color: 'text-yellow-400' },
    { name: '10+ Years', icon: TrendingUp, color: 'text-orange-400' },
  ]

  return (
    <footer className="bg-[#111008] text-gray-300" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Hex pattern overlay – subtle */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-30 pointer-events-none" />
        <style>{`
          .hex-pattern {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.06'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.77V15zm25 5.28l-2 1.16v-5.1L28 14v-2.61l-10-5.77v-4h-2v4.19L4 10.48V13l11 6.35V44h2V19.35L28 13v-3l-3 1.73V15l-2 1.16v3.1z'/%3E%3C/g%3E%3C/svg%3E");
          }
        `}</style>

        <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-16 relative z-10">
          {/* Top — brand + newsletter (gold accents) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12 mb-12 border-b border-[#C9A84C]/15">
            <div>
              <h3 className="font-display text-3xl font-medium text-white mb-3 tracking-tight">
                DURABLE HOMES
              </h3>
              <p className="text-gray-400 mb-4 max-w-md leading-relaxed">
                Premium building materials, interior finishes, and aesthetic solutions
                for contractors, architects, and homeowners across Nigeria.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-[#C9A84C]" />
                  <span>Professional Grade</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#C9A84C]" />
                  <span>Bulk Orders Welcome</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#C9A84C]" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>

            <div className="lg:pl-8">
              <h4 className="text-white font-semibold mb-3 font-display text-lg">Subscribe to Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest updates on new materials, industry news, and exclusive offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#1a1710] border-[#C9A84C]/20 text-white placeholder:text-gray-500 focus:border-[#C9A84C]/60 transition-colors flex-1"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-semibold"
                  loading={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-3">
                By subscribing, you agree to our{' '}
                <Link href="/privacy" className="underline hover:text-[#C9A84C] transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Links grid – refined spacing and hover effect */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-semibold mb-4 font-display tracking-wide text-sm uppercase">Shop</h4>
              <ul className="space-y-2">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 font-display tracking-wide text-sm uppercase">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <h4 className="text-white font-semibold mb-4 mt-6 font-display tracking-wide text-sm uppercase">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 font-display tracking-wide text-sm uppercase">My Account</h4>
              <ul className="space-y-2">
                {footerLinks.account.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors flex items-center gap-1 group"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 font-display tracking-wide text-sm uppercase">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin className="h-4 w-4 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                  <span>123 Construction Avenue, Ikeja, Lagos, Nigeria</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />
                  <a href="tel:+234123456789" className="hover:text-[#C9A84C] transition-colors">
                    +234 123 456 789
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />
                  <a
                    href="mailto:sales@durablehomes.com"
                    className="hover:text-[#C9A84C] transition-colors"
                  >
                    sales@durablehomes.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Clock className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />
                  <span>Mon–Fri: 8am–6pm · Sat: 9am–4pm</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Certifications + payment – gold border accents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-[#C9A84C]/15">
            <div>
              <h4 className="text-white font-semibold mb-3 font-display text-sm uppercase tracking-wide">Certifications & Standards</h4>
              <div className="flex flex-wrap gap-3">
                {certifications.map((cert) => {
                  const Icon = cert.icon
                  return (
                    <div
                      key={cert.name}
                      className="flex items-center gap-2 bg-[#1a1710] border border-[#C9A84C]/10 px-3 py-2 rounded-lg"
                    >
                      <Icon className={`h-4 w-4 ${cert.color}`} />
                      <span className="text-xs text-gray-300">{cert.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 font-display text-sm uppercase tracking-wide">Secure Payments</h4>
              <div className="flex flex-wrap gap-3">
                {['Paystack', 'Flutterwave', 'Bank Transfer'].map((method) => (
                  <div
                    key={method}
                    className="bg-[#1a1710] border border-[#C9A84C]/10 px-3 py-2 rounded-lg text-xs text-gray-300 font-medium"
                  >
                    {method}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>SSL Encrypted · All transactions are secure</span>
              </div>
            </div>
          </div>

          {/* Social + copyright – gold hover */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[#C9A84C]/15 gap-4">
            <div className="flex gap-3">
              {[
                { label: 'Facebook', icon: Facebook, href: '#' },
                { label: 'Twitter', icon: Twitter, href: '#' },
                { label: 'Instagram', icon: Instagram, href: '#' },
                { label: 'YouTube', icon: Youtube, href: '#' },
              ].map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="bg-[#1a1710] border border-[#C9A84C]/20 p-2 rounded-full hover:bg-[#C9A84C] hover:border-[#C9A84C] transition-colors group"
                >
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-[#111008] transition-colors" />
                </a>
              ))}
            </div>

            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500">
                © {currentYear} Durable Homes. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 mt-1">Developed by Oyibo Daniel</p>
            </div>
          </div>
        </div>

        {/* Bottom bar – minimal gold line */}
        <div className="bg-[#0c0b07] py-3">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <Link href="/terms" className="hover:text-[#C9A84C] transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-[#C9A84C] transition-colors">Privacy</Link>
                <Link href="/contact" className="hover:text-[#C9A84C] transition-colors">Contact</Link>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3" />
                <span>Secure Shopping · All transactions are encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}