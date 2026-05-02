import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, Twitter, Facebook } from 'lucide-react'
import Image from 'next/image'

const LINKS = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Cement & Concrete', href: '/shop?category=cement' },
    { label: 'Steel & Iron', href: '/shop?category=steel' },
    { label: 'Roofing', href: '/shop?category=roofing' },
    { label: 'Tiles & Flooring', href: '/shop?category=tiles' },
    { label: 'Paints', href: '/shop?category=paints' },
  ],
  Account: [
    { label: 'My Account', href: '/account' },
    { label: 'Orders', href: '/account/orders' },
    { label: 'Wishlist', href: '/account/wishlist' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
}

export function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        .hex-bg-footer {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>

      <footer className="bg-[#111008] hex-bg-footer border-t border-white/5">
        {/* Top CTA strip */}
        <div className="border-b border-[#C9A84C]/15">
          <div className="container mx-auto px-6 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-display text-2xl text-white font-medium">Need a bulk quote?</p>
              <p className="text-gray-500 text-sm mt-1">Our team responds within 2 hours on business days.</p>
            </div>
            <Link href="/contact"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold px-8 py-3.5 transition-colors text-sm">
              Contact Sales →
            </Link>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className=" flex items-center justify-center flex-shrink-0">
                  <Image src="/images/DurableHomesLogo.png" alt="Durable Homes Logo" width={100} height={100} className="h-9 w-9" />
                </div>
                <div>
                  <span className="font-display text-xl text-white font-semibold block leading-none">Durable Homes</span>
                  <span className="text-[#C9A84C] text-[9px] tracking-[0.25em] uppercase">Building Materials</span>
                </div>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
                Your trusted partner for premium building materials across Nigeria.
                Quality products, professional service, delivered to your site.
              </p>
              <div className="space-y-3">
                <a href="tel:+2341234567890" className="flex items-center gap-3 text-gray-400 hover:text-[#C9A84C] text-sm transition-colors">
                  <Phone className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />+234 123 456 7890
                </a>
                <a href="mailto:sales@durablehomes.com" className="flex items-center gap-3 text-gray-400 hover:text-[#C9A84C] text-sm transition-colors">
                  <Mail className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />sales@durablehomes.com
                </a>
                <div className="flex items-start gap-3 text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />123 Construction Ave, Ikeja, Lagos
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 border border-white/10 hover:border-[#C9A84C]/50 flex items-center justify-center text-gray-500 hover:text-[#C9A84C] transition-all">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(LINKS).map(([title, links]) => (
              <div key={title}>
                <p className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
                  <span className="w-4 h-px bg-[#C9A84C] inline-block" />
                  {title}
                </p>
                <ul className="space-y-3">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} className="text-gray-500 hover:text-[#C9A84C] text-sm transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="container mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Durable Homes. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Privacy</Link>
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}