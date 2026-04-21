import { prisma } from '@/lib/db'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { 
  HardHat, 
  Building2, 
  Users, 
  Truck, 
  Shield, 
  Award,
  Clock,
  HeartHandshake,
  CheckCircle,
  ArrowRight,
  Hammer,
  Ruler,
  Package,
  TrendingUp,
  ChevronRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Durable Homes | Building Materials & Construction Supplies',
  description: 'Learn about Durable Homes - your trusted partner for quality building materials, construction supplies, and expert advice since 2020.',
}

async function getStats() {
  const [
    totalProducts,
    totalCategories,
    totalOrders,
    totalCustomers
  ] = await Promise.all([
    prisma.product.count({ where: { status: 'PUBLISHED' } }),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } })
  ])

  return {
    products: totalProducts,
    categories: totalCategories,
    orders: totalOrders,
    customers: totalCustomers
  }
}

// Team members (replace with actual images later)
const teamMembers = [
  {
    name: 'Oyibo Daniel',
    role: 'Founder & CEO',
    bio: 'Construction engineer with over 15 years of experience in building materials and project management.',
    image: '/images/team/daniel.jpg',
    expertise: ['Structural Engineering', 'Supply Chain', 'Quality Control']
  },
  {
    name: 'Amina Usman',
    role: 'Head of Operations',
    bio: 'Supply chain expert ensuring timely delivery of quality materials to construction sites across Nigeria.',
    image: '/images/team/amina.jpg',
    expertise: ['Logistics', 'Inventory Management', 'Client Relations']
  },
  {
    name: 'Chidi Okonkwo',
    role: 'Technical Director',
    bio: 'Building materials specialist with expertise in product specifications and quality assurance.',
    image: '/images/team/chidi.jpg',
    expertise: ['Material Science', 'Quality Assurance', 'Technical Support']
  },
  {
    name: 'Funke Adebayo',
    role: 'Customer Relations Manager',
    bio: 'Dedicated to ensuring every client gets the best service and support for their projects.',
    image: '/images/team/funke.jpg',
    expertise: ['Customer Service', 'Project Consulting', 'Client Success']
  }
]

// Milestones
const milestones = [
  {
    year: '2020',
    title: 'Company Founded',
    description: 'Durable Homes established in Lagos, Nigeria with a vision to revolutionize building material supply.',
    icon: Building2
  },
  {
    year: '2021',
    title: 'First Major Project',
    description: 'Supplied materials for 50-unit housing development in Lekki Phase 1.',
    icon: Hammer
  },
  {
    year: '2022',
    title: 'Expansion to Abuja',
    description: 'Opened second branch to serve northern Nigeria construction industry.',
    icon: Truck
  },
  {
    year: '2023',
    title: '10,000+ Customers',
    description: 'Served over 10,000 satisfied customers across Nigeria.',
    icon: Users
  },
  {
    year: '2024',
    title: 'ISO 9001 Certification',
    description: 'Achieved international quality management certification.',
    icon: Award
  },
  {
    year: '2025',
    title: 'Port Harcourt Branch',
    description: 'Expanded to serve the South-South region.',
    icon: TrendingUp
  }
]

// Values
const values = [
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Every product meets strict quality standards and is tested for durability and performance.'
  },
  {
    icon: Truck,
    title: 'Reliable Delivery',
    description: 'Timely delivery to your site, anywhere in Nigeria, with our fleet of trucks.'
  },
  {
    icon: Users,
    title: 'Expert Support',
    description: 'Technical experts available to help you choose the right materials for your project.'
  },
  {
    icon: HeartHandshake,
    title: 'Integrity',
    description: 'Honest pricing, transparent dealings, and long-term partnerships with our clients.'
  }
]

export default async function AboutPage() {
  const stats = await getStats()

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* Hex pattern (global) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        .hex-pattern {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.05'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.77V15zm25 5.28l-2 1.16v-5.1L28 14v-2.61l-10-5.77v-4h-2v4.19L4 10.48V13l11 6.35V44h2V19.35L28 13v-3l-3 1.73V15l-2 1.16v3.1z'/%3E%3C/g%3E%3C/svg%3E");
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .animate-fadeup { animation: fadeUp 0.7s ease both; }
        .animate-fadeup-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .animate-fadeup-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(201,168,76,0.15); }
      `}</style>

      {/* ── HERO (dark / gold) ────────────────────────────────────────────── */}
      <section className="relative bg-[#111008] text-white overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-30" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)'
        }} />

        <div className="container mx-auto px-6 lg:px-12 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 border border-[#C9A84C]/20 bg-[#C9A84C]/10 px-4 py-2 rounded-full mb-6">
              <HardHat className="h-4 w-4 text-[#C9A84C]" />
              <span className="text-sm text-[#C9A84C] font-medium">Building Since 2020</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium mb-6 leading-tight">
              Building <span className="text-[#C9A84C]">Nigeria's Future</span><br />
              One Project at a Time
            </h1>
            
            <p className="text-lg text-gray-300 mb-10 max-w-2xl">
              Durable Homes is your trusted partner for premium building materials, 
              construction supplies, and expert technical support across Nigeria.
            </p>

            {/* Stats - gold accent */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: 'Products', value: stats.products },
                { label: 'Customers', value: stats.customers },
                { label: 'Projects', value: stats.orders },
                { label: 'Categories', value: stats.categories }
              ].map((stat) => (
                <div key={stat.label} className="border-l-2 border-[#C9A84C] pl-4">
                  <p className="text-3xl font-bold text-white">{stat.value}+</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gold bottom line */}
        <div className="h-0.5 bg-gradient-to-r from-[#C9A84C]/20 via-[#C9A84C] to-[#C9A84C]/20" />
      </section>

      {/* ── OUR STORY ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fadeup">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold">Our Story</span>
              </div>

              <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900 mb-6">
                From a Single Vision to{' '}
                <span className="text-[#C9A84C]">Industry Leader</span>
              </h2>

              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2020 by Oyibo Daniel, Durable Homes began with a simple mission: 
                  to provide Nigerian builders and contractors with access to high-quality, 
                  durable building materials at fair prices.
                </p>
                <p>
                  What started as a small operation in Lagos has grown into a trusted name 
                  in the construction industry, serving thousands of customers across Nigeria. 
                  We've supplied materials for residential homes, commercial buildings, 
                  and major infrastructure projects.
                </p>
                <p>
                  Our commitment to quality, reliability, and customer support has made us 
                  the preferred choice for contractors, architects, and homeowners alike. 
                  We don't just sell materials – we partner with you to ensure your project's success.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-[#111008] hover:bg-[#1e1a0d] text-white font-semibold px-6 py-3 transition-all group"
                >
                  Browse Products
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-gray-300 hover:border-[#C9A84C] text-gray-700 hover:text-[#C9A84C] px-6 py-3 transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Feature cards */}
            <div className="relative animate-fadeup-1">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A84C]/10 to-transparent rounded-2xl" />
              <div className="relative grid grid-cols-2 gap-5">
                <div className="space-y-5">
                  <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm card-hover">
                    <HardHat className="h-8 w-8 text-[#C9A84C] mb-3" />
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Quality Materials</h3>
                    <p className="text-sm text-gray-500">All products sourced from trusted manufacturers</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm card-hover">
                    <Truck className="h-8 w-8 text-[#C9A84C] mb-3" />
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Fleet Delivery</h3>
                    <p className="text-sm text-gray-500">Own fleet ensuring timely site delivery</p>
                  </div>
                </div>
                <div className="space-y-5 mt-8">
                  <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm card-hover">
                    <Users className="h-8 w-8 text-[#C9A84C] mb-3" />
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Expert Team</h3>
                    <p className="text-sm text-gray-500">Technical experts ready to assist</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm card-hover">
                    <Award className="h-8 w-8 text-[#C9A84C] mb-3" />
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Certified Quality</h3>
                    <p className="text-sm text-gray-500">ISO 9001:2025 certified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#faf9f6]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold">Our Values</span>
              <div className="h-px w-8 bg-[#C9A84C]" />
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
              What Drives Us
            </h2>
            <p className="text-gray-600">
              These core principles guide everything we do, from product selection to customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => {
              const Icon = value.icon
              return (
                <div key={idx} className="bg-white p-8 rounded-xl border border-gray-100 hover:border-[#C9A84C]/40 transition-all card-hover text-center">
                  <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:bg-[#C9A84C]/20 transition-colors">
                    <Icon className="h-8 w-8 text-[#C9A84C]" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── MILESTONES (timeline) ────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold">Our Journey</span>
              <div className="h-px w-8 bg-[#C9A84C]" />
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
              Key Milestones
            </h2>
            <p className="text-gray-600">
              Tracking our growth and achievements since day one.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line (desktop) */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200 hidden lg:block" />

            <div className="space-y-12 relative">
              {milestones.map((milestone, idx) => {
                const Icon = milestone.icon
                const isEven = idx % 2 === 0

                return (
                  <div key={idx} className={`flex flex-col lg:flex-row ${isEven ? '' : 'lg:flex-row-reverse'} items-center gap-8`}>
                    <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'} w-full lg:w-auto`}>
                      <div className={`bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:border-[#C9A84C]/40 transition-all ${isEven ? 'lg:mr-8' : 'lg:ml-8'}`}>
                        <span className="text-[#C9A84C] font-bold text-sm uppercase tracking-wide">{milestone.year}</span>
                        <h3 className="font-bold text-xl text-gray-900 mt-2 mb-2">{milestone.title}</h3>
                        <p className="text-gray-500">{milestone.description}</p>
                      </div>
                    </div>

                    {/* Icon circle */}
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-[#C9A84C] rounded-full flex items-center justify-center border-4 border-white shadow-md">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 hidden lg:block" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#faf9f6]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold">Our Team</span>
              <div className="h-px w-8 bg-[#C9A84C]" />
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900 mb-4">
              Meet the Experts
            </h2>
            <p className="text-gray-600">
              Dedicated professionals committed to your project's success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-[#C9A84C]/40 transition-all card-hover group">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <HardHat className="h-16 w-16 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-[#C9A84C] font-semibold mb-3">{member.role}</p>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{member.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (gold gradient) ──────────────────────────────────────────── */}
      <section className="py-20 bg-[#C9A84C] relative overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-20" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.05) 0%, transparent 70%)'
        }} />
        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
          <h2 className="font-display text-4xl lg:text-6xl font-medium text-[#111008] mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-[#111008]/70 text-lg mb-10 max-w-xl mx-auto">
            Browse our extensive catalog of premium building materials or contact our team for expert advice.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-[#111008] hover:bg-[#1e1a0d] text-white font-semibold px-10 py-4 transition-all group"
            >
              <Package className="h-5 w-5" />
              Browse Products
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 border-2 border-[#111008]/30 hover:border-[#111008] text-[#111008] font-semibold px-10 py-4 transition-all"
            >
              <Users className="h-5 w-5" />
              Contact Sales Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}