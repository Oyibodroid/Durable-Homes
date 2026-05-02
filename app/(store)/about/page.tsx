import Link from 'next/link'
import { ShieldCheck, Truck, Award, Users, ArrowRight, CheckCircle, HardHat, Package } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getStats() {
  const [products, orders, users] = await Promise.all([
    prisma.product.count({ where: { status: 'PUBLISHED' } }),
    prisma.order.count({ where: { paymentStatus: 'COMPLETED' } }),
    prisma.user.count(),
  ])
  return { products, orders, users }
}

export default async function AboutPage() {
  const stats = await getStats()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito:wght@300;400;500;600&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .anim-1 { animation:fadeUp 0.65s 0.05s ease both; }
        .anim-2 { animation:fadeUp 0.65s 0.15s ease both; }
        .anim-3 { animation:fadeUp 0.65s 0.25s ease both; }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .gold-shimmer {
          background:linear-gradient(90deg,#C9A84C 0%,#f0d080 40%,#C9A84C 60%,#f0d080 100%);
          background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:shimmer 3s linear infinite;
        }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
        .card-lift { transition:transform 0.28s ease,box-shadow 0.28s ease; }
        .card-lift:hover { transform:translateY(-4px); box-shadow:0 16px 36px rgba(201,168,76,0.12); }
      `}</style>

      <div className="min-h-screen bg-white" style={{ fontFamily:"'Nunito',sans-serif", paddingTop:'80px' }}>

        {/* Hero */}
        <section className="bg-[#111008] hex-bg pt-20 pb-24 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background:'radial-gradient(ellipse 70% 60% at 60% 50%,rgba(201,168,76,0.07) 0%,transparent 70%)' }} />
          {/* Floating shapes */}
          <div className="absolute top-12 right-[12%] w-24 h-24 border border-[#C9A84C]/12 rotate-45 hidden lg:block" />
          <div className="absolute bottom-16 right-[28%] w-14 h-14 border border-[#C9A84C]/10 rotate-12 hidden lg:block" />

          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="max-w-3xl">
              <div className="anim-1 flex items-center gap-3 mb-6">
                <span className="w-7 h-px bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Our Story</span>
              </div>
              <h1 className="anim-2 font-display text-5xl lg:text-7xl font-medium leading-[1.05] mb-6">
                <span className="text-white">Building Nigeria's</span><br />
                <span className="gold-shimmer">Future Together</span>
              </h1>
              <p className="anim-3 text-gray-400 text-lg leading-relaxed max-w-xl">
                Since 2015, Durable Homes has supplied contractors, developers, and
                homeowners with the professional-grade materials they need to build with
                confidence.
              </p>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-[#C9A84C]">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#111008]/10">
              {[
                { value: stats.products + '+', label: 'Products' },
                { value: stats.orders.toLocaleString() + '+', label: 'Orders Completed' },
                { value: stats.users.toLocaleString() + '+', label: 'Customers' },
                { value: '12+', label: 'Cities Served' },
              ].map(({ value, label }) => (
                <div key={label} className="py-8 px-6 text-center">
                  <p className="font-display text-4xl font-semibold text-[#111008]">{value}</p>
                  <p className="text-[#111008]/60 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-7 h-px bg-[#C9A84C]" />
                  <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Our Mission</span>
                </div>
                <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900 mb-6 leading-tight">
                  Quality you can rely on, every single time
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  We believe that great buildings start with great materials. That's why
                  every product in our catalogue is personally vetted by our technical team
                  against SON and ISO standards before it reaches our shelves.
                </p>
                <p className="text-gray-500 leading-relaxed mb-8">
                  From the individual homeowner building their first house to the
                  contractor managing a high-rise development, we offer the same
                  premium-grade materials, expert advice, and reliable delivery.
                </p>
                <ul className="space-y-3">
                  {[
                    'ISO and SON certified products only',
                    'Transparent pricing with no hidden fees',
                    'Technical advice from certified engineers',
                    'Bulk order discounts for contractors',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual card */}
              <div className="relative">
                <div className="bg-[#111008] p-10 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-[#C9A84C]/20" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-[#C9A84C]/20" />
                  <HardHat className="h-10 w-10 text-[#C9A84C] mb-6" />
                  <p className="font-display text-2xl text-white italic mb-4 leading-snug">
                    "We don't just sell materials. We help build the places people call home."
                  </p>
                  <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#C9A84C]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#C9A84C] font-bold text-sm">OD</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Oyibo Daniel</p>
                      <p className="text-gray-500 text-xs">Founder, Durable Homes</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#C9A84C]/15 -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-[#faf9f6]">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="w-7 h-px bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Our Values</span>
                <span className="w-7 h-px bg-[#C9A84C]" />
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900">What We Stand For</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: ShieldCheck, title: 'Quality First', desc: 'Every product is tested and certified. We never compromise on the standards that keep your buildings standing.' },
                { icon: Users, title: 'Customer Focus', desc: 'From first enquiry to final delivery, our team is with you every step. Real humans, real answers.' },
                { icon: Truck, title: 'Reliable Delivery', desc: 'We know construction timelines are tight. Our logistics network covers 12+ Nigerian cities with on-time delivery.' },
                { icon: Award, title: 'Trusted by Pros', desc: 'Thousands of contractors and developers choose Durable Homes because our reputation depends on their success.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white border border-gray-100 p-7 card-lift group">
                  <div className="w-11 h-11 border border-[#C9A84C]/30 flex items-center justify-center mb-5 group-hover:bg-[#C9A84C]/5 transition-colors">
                    <Icon className="h-5 w-5 text-[#C9A84C]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="w-7 h-px bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">The Team</span>
                <span className="w-7 h-px bg-[#C9A84C]" />
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900">People Behind the Brand</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { name: 'Oyibo Daniel', role: 'Founder & CEO', initial: 'OD' },
                { name: 'Amaka Obi', role: 'Head of Operations', initial: 'AO' },
                { name: 'Kunle Adeyemi', role: 'Technical Director', initial: 'KA' },
              ].map(({ name, role, initial }) => (
                <div key={name} className="text-center card-lift group border border-gray-100 p-8">
                  <div className="w-20 h-20 bg-[#111008] border border-[#C9A84C]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-[#C9A84C]/50 transition-colors">
                    <span className="font-display text-2xl text-[#C9A84C] font-medium">{initial}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="text-gray-500 text-sm mt-1">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-[#111008] hex-bg">
          <div className="container mx-auto px-6 lg:px-12 text-center">
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-white mb-4">
              Ready to start building?
            </h2>
            <p className="text-gray-400 mb-10 max-w-lg mx-auto">
              Browse our full catalogue or reach out to our team for expert advice on your next project.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/shop" className="inline-flex items-center gap-3 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold px-10 py-4 transition-colors">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-3 border border-[#C9A84C]/40 hover:border-[#C9A84C] text-[#C9A84C] font-semibold px-10 py-4 transition-all">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}