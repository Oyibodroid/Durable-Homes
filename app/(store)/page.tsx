import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Star,
  Package,
  HardHat,
  CheckCircle,
  Phone,
  ChevronRight,
} from "lucide-react";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", featured: true },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isMain: true }, take: 1 },
      category: { select: { name: true } },
      _count: { select: { reviews: true } },
    },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    take: 6,
    include: {
      _count: { select: { products: true } },
      products: {
        where: { status: "PUBLISHED" }, // Only take images from active products
        take: 1,
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            where: { isMain: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { products: { _count: "desc" } },
  });
}

async function getStats() {
  const [products, completedOrders, users] = await Promise.all([
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.order.count({ where: { paymentStatus: "COMPLETED" } }),
    prisma.user.count(),
  ]);
  return { products, completedOrders, users };
}

export default async function HomePage() {
  const [featured, categories, stats] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getStats(),
  ]);

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Nunito:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .animate-fadeup { animation: fadeUp 0.7s ease both; }
        .animate-fadeup-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .animate-fadeup-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .animate-fadeup-3 { animation: fadeUp 0.7s 0.35s ease both; }
        .animate-fadeup-4 { animation: fadeUp 0.7s 0.5s ease both; }
        .gold-shimmer {
          background: linear-gradient(90deg, #C9A84C 0%, #f0d080 40%, #C9A84C 60%, #f0d080 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .hex-pattern {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.06'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.77V15zm25 5.28l-2 1.16v-5.1L28 14v-2.61l-10-5.77v-4h-2v4.19L4 10.48V13l11 6.35V44h2V19.35L28 13v-3l-3 1.73V15l-2 1.16v3.1z'/%3E%3C/g%3E%3C/svg%3E");
        }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(201,168,76,0.15); }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#111008] overflow-hidden flex items-center">
        {/* Background geometric layers */}
        <div className="absolute inset-0 hex-pattern" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Vertical gold accent line */}
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/30 to-transparent hidden lg:block" />

        {/* Floating geometric shapes */}
        <div
          className="absolute top-20 right-[15%] w-32 h-32 border border-[#C9A84C]/15 rotate-45 animate-float hidden lg:block"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute bottom-32 right-[25%] w-16 h-16 border border-[#C9A84C]/10 rotate-12 animate-float hidden lg:block"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/2 right-[8%] w-48 h-48 border border-[#C9A84C]/08 -rotate-12 animate-float hidden lg:block"
          style={{ animationDelay: "0.8s" }}
        />

        {/* Large background number */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[28rem] font-semibold text-white/[0.02] select-none leading-none hidden xl:block">
          01
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10 py-24 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — Copy */}
            <div>
              {/* Eyebrow */}
              <div className="animate-fadeup inline-flex items-center gap-2 mb-8">
                <div className="h-px w-8 bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase font-semibold">
                  Premium Building Materials
                </span>
              </div>

              {/* Headline */}
              <h1 className="animate-fadeup-1 font-display text-5xl lg:text-7xl font-medium leading-[1.05] mb-6">
                <span className="text-white block">Build With</span>
                <span className="gold-shimmer block">Confidence.</span>
                <span className="text-white/70 block text-4xl lg:text-5xl mt-1 italic">
                  Build to Last.
                </span>
              </h1>

              <p className="animate-fadeup-2 text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
                Professional-grade building materials for contractors and
                homeowners across Nigeria. Quality you can trust, delivered to
                your site.
              </p>

              {/* CTAs */}
              <div className="animate-fadeup-3 flex flex-wrap gap-4 mb-14">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-3 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-semibold px-8 py-4 transition-all duration-300"
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 border border-white/20 hover:border-[#C9A84C]/60 text-white hover:text-[#C9A84C] px-8 py-4 transition-all duration-300"
                >
                  Get a Quote
                </Link>
              </div>

              {/* Trust strip */}
              <div className="animate-fadeup-4 flex flex-wrap gap-6">
                {[
                  { icon: ShieldCheck, text: "ISO Certified" },
                  { icon: Truck, text: "Fast Delivery" },
                  { icon: Star, text: "4.8★ Rated" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-gray-500 text-sm"
                  >
                    <Icon className="h-4 w-4 text-[#C9A84C]" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Visual card stack */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Main card */}
              <div className="relative z-10 w-72 bg-gradient-to-br from-[#1e1a0d] to-[#0d0c07] border border-[#C9A84C]/20 p-8 shadow-2xl">
                <div className="w-12 h-12 bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mb-6">
                  <HardHat className="h-6 w-6 text-[#C9A84C]" />
                </div>
                <p className="text-white/40 text-xs tracking-widest uppercase mb-1">
                  This Month
                </p>
                <p className="font-display text-4xl text-white font-medium mb-1">
                  {stats.completedOrders.toLocaleString()}+
                </p>
                <p className="text-[#C9A84C] text-sm">Orders Completed</p>
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between">
                  <div>
                    <p className="text-white/30 text-xs mb-1">Products</p>
                    <p className="text-white font-semibold">
                      {stats.products}+
                    </p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs mb-1">Customers</p>
                    <p className="text-white font-semibold">
                      {stats.users.toLocaleString()}+
                    </p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs mb-1">Cities</p>
                    <p className="text-white font-semibold">12+</p>
                  </div>
                </div>
              </div>

              {/* Offset card behind */}
              <div className="absolute top-8 right-4 w-72 h-full bg-[#C9A84C]/5 border border-[#C9A84C]/10 -z-0" />
              <div className="absolute top-16 right-8 w-72 h-full bg-[#C9A84C]/3 border border-[#C9A84C]/5 -z-10" />

              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 bg-white px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verified Supplier</p>
                    <p className="text-xs font-bold text-gray-900">
                      CAC registered
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── MARQUEE STRIP ─────────────────────────────────────────────────────── */}
      <div className="bg-[#C9A84C] py-3 overflow-hidden">
        <div
          className="flex gap-12 animate-[marquee_20s_linear_infinite] whitespace-nowrap"
          style={{ width: "max-content" }}
        >
          {Array(3)
            .fill([
              " Cement & Concrete",
              " Steel & Iron",
              " Windows & Doors",
              " Paints & Finishes",
              " Roofing Materials",
              " Plumbing",
              "  Electrical",
            ])
            .flat()
            .map((item, i) => (
              <span
                key={i}
                className="text-[#111008] font-semibold text-sm tracking-wide"
              >
                {item}
              </span>
            ))}
        </div>
        <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}`}</style>
      </div>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold">
                  Browse
                </span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-2 text-[#C9A84C] font-medium hover:gap-3 transition-all text-sm"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => {
              // Correctly extract the image URL from the nested products query
              const categoryImage = cat.products[0]?.images[0]?.url;

              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className="group card-hover"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden mb-3">
                    {categoryImage ? (
                      <Image
                        src={categoryImage}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-50">
                        <Package className="h-10 w-10 text-gray-300" />
                      </div>
                    )}

                    {/* Overlay for count */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] text-white uppercase tracking-widest font-bold bg-[#C9A84C] px-2 py-0.5">
                        {cat._count.products} Items
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#C9A84C] transition-colors leading-snug">
                    {cat.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ───────────────────────────────────────────────── */}
      <section className="py-24 bg-[#faf9f6]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold">
                  Featured
                </span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-2 text-[#C9A84C] font-medium hover:gap-3 transition-all text-sm"
            >
              Shop all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featured.map((product) => {
                const img = product.images[0]?.url;
                const price = Number(product.price);
                const compareAt = product.compareAtPrice
                  ? Number(product.compareAtPrice)
                  : null;
                const discount = compareAt
                  ? Math.round(((compareAt - price) / compareAt) * 100)
                  : 0;
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className="group card-hover bg-white"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {img ? (
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1">
                          -{discount}%
                        </div>
                      )}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 backdrop-blur-sm p-1.5">
                          <Star className="h-4 w-4 text-[#C9A84C]" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                        {product.category?.name}
                      </p>
                      <p className="font-semibold text-gray-900 group-hover:text-[#C9A84C] transition-colors line-clamp-2 text-sm leading-snug mb-3">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900">
                            ₦{price.toLocaleString()}
                          </p>
                          {compareAt && (
                            <p className="text-xs text-gray-400 line-through">
                              ₦{compareAt.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-[#C9A84C] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="h-14 w-14 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No featured products yet.</p>
              <Link
                href="/shop"
                className="text-[#C9A84C] font-medium hover:underline"
              >
                Browse all products →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY CHOOSE US ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#111008] relative overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-50" />
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 90% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold">
                Why Us
              </span>
              <div className="h-px w-8 bg-[#C9A84C]" />
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-white">
              Built on Trust
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Certified Quality",
                desc: "Every product meets SON and ISO standards. We only stock what we can stand behind.",
                stat: "100%",
              },
              {
                icon: Truck,
                title: "Nationwide Delivery",
                desc: "Lagos, Abuja, Port Harcourt and beyond. Bulk orders delivered to your site.",
                stat: "12+ Cities",
              },
              {
                icon: Star,
                title: "Top Rated",
                desc: "Over 4.8 stars across thousands of verified customer reviews.",
                stat: "4.8 ★",
              },
              {
                icon: Phone,
                title: "Expert Support",
                desc: "Technical advice from our team before, during, and after your purchase.",
                stat: "24/7",
              },
            ].map(({ icon: Icon, title, desc, stat }) => (
              <div
                key={title}
                className="group border border-[#C9A84C]/15 hover:border-[#C9A84C]/40 p-7 transition-all duration-300 hover:bg-[#C9A84C]/5"
              >
                <div className="w-12 h-12 border border-[#C9A84C]/30 flex items-center justify-center mb-5 group-hover:bg-[#C9A84C]/10 transition-colors">
                  <Icon className="h-5 w-5 text-[#C9A84C]" />
                </div>
                <p className="font-display text-3xl text-[#C9A84C] font-medium mb-1">
                  {stat}
                </p>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase font-semibold">
                Reviews
              </span>
              <div className="h-px w-8 bg-[#C9A84C]" />
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-medium text-gray-900">
              What Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Emeka O.",
                location: "Lagos",
                review:
                  "Ordered cement and iron rods for my building project. Delivery was on time and the quality is exactly what was described. Will be back for Phase 2.",
                rating: 5,
              },
              {
                name: "Adaeze K.",
                location: "Abuja",
                review:
                  "The tiles I bought are stunning and held up perfectly during installation. Customer service team was very helpful when I had questions about quantity.",
                rating: 5,
              },
              {
                name: "Tunde B.",
                location: "Port Harcourt",
                review:
                  "Best building materials supplier I have found online. Competitive prices and genuine products. My contractor has already placed three orders this month.",
                rating: 5,
              },
            ].map(({ name, location, review, rating }) => (
              <div
                key={name}
                className="border border-gray-100 p-7 hover:border-[#C9A84C]/30 transition-colors card-hover"
              >
                <div className="flex gap-1 mb-4">
                  {Array(rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-[#C9A84C] fill-[#C9A84C]"
                      />
                    ))}
                </div>
                <p className="font-display italic text-gray-700 text-[17px] leading-relaxed mb-6">
                  "{review}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C] font-bold text-sm">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {name}
                    </p>
                    <p className="text-xs text-gray-400">{location}, Nigeria</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#C9A84C] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23111008' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
          <h2 className="font-display text-4xl lg:text-6xl font-medium text-[#111008] mb-4">
            Ready to Build?
          </h2>
          <p className="text-[#111008]/70 text-lg mb-10 max-w-xl mx-auto">
            Browse our full catalogue of 500+ premium building materials and get
            everything delivered to your site.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 bg-[#111008] hover:bg-[#1e1a0d] text-white font-semibold px-10 py-4 transition-all duration-300"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 border-2 border-[#111008]/30 hover:border-[#111008] text-[#111008] font-semibold px-10 py-4 transition-all duration-300"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
