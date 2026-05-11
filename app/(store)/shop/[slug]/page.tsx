import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product/ProductGallery'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { ReviewForm } from '@/components/product/ReviewForm'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import {
  ChevronRight, Star, Package, Ruler, Weight, Shield,
  Award, Clock, Truck, Zap, CheckCircle, FileText,
  HardHat, Flame, Droplets, Wind, Hammer, AlertTriangle,
  Scale, Gauge, Thermometer, Share2
} from 'lucide-react'

interface Props { params: Promise<{ slug: string }> }

function getWeight(name: string) {
  const map: Record<string, string> = { cement:'50kg', paint:'20kg', tile:'32kg/m²', steel:'7850kg/m³', rod:'2.5kg/m', pipe:'3.5kg/m', door:'35kg', window:'25kg' }
  const l = name.toLowerCase()
  return Object.entries(map).find(([k]) => l.includes(k))?.[1] ?? 'See spec sheet'
}
function getDims(name: string) {
  const map: Record<string, string> = { tile:'300×300mm', rod:'12m length', pipe:'6m length', sheet:'2.4×1.2m', door:'2100×900mm', window:'1200×1200mm', cement:'50kg bag', paint:'20L / 4L / 1L' }
  const l = name.toLowerCase()
  return Object.entries(map).find(([k]) => l.includes(k))?.[1] ?? 'Standard dimensions'
}
function getFeatures(cat: string) {
  const base = [{ icon: Shield, text: 'Heavy-Duty Build' }, { icon: Award, text: 'ISO/SON Certified' }]
  if (cat.includes('Cement')) return [...base, { icon: Flame, text: 'Fire Resistant' }, { icon: Droplets, text: 'Water Resistant' }, { icon: Gauge, text: 'High Compressive Strength' }]
  if (cat.includes('Steel')) return [...base, { icon: Hammer, text: 'Impact Resistant' }, { icon: Thermometer, text: 'Heat Treated' }, { icon: Scale, text: 'High Tensile Strength' }]
  if (cat.includes('Paint')) return [...base, { icon: Droplets, text: 'Waterproof' }, { icon: Wind, text: 'Weather Resistant' }]
  if (cat.includes('Tile')) return [...base, { icon: Droplets, text: 'Waterproof' }, { icon: Hammer, text: 'Scratch Resistant' }]
  if (cat.includes('Roofing')) return [...base, { icon: Wind, text: 'Wind Resistant' }, { icon: Droplets, text: 'Leak Proof' }]
  return base
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await prisma.product.findUnique({ where: { slug }, select: { name: true, shortDescription: true } })
  return { title: p?.name ?? 'Product', description: p?.shortDescription ?? undefined }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { include: { parent: true } },
      images: { orderBy: { position: 'asc' } },
      variants: true,
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true, wishlistedBy: true } },
    },
  })
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId!, id: { not: product.id }, status: 'PUBLISHED' },
    include: { images: { where: { isMain: true }, take: 1 }, category: true },
    orderBy: { featured: 'desc' },
    take: 4,
  })

  const price = Number(product.price)
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null
  const discount = compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0
  const avg = product.reviews.reduce((a, r) => a + r.rating, 0) / (product.reviews.length || 1)
  const cat = product.category?.name ?? 'General'
  const features = getFeatures(cat)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;500;600;700&display=swap');
        .font-display{font-family:'Cormorant Garamond',serif;}
        .hex-bg{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E");}
      `}</style>

      <div className="min-h-screen bg-[#faf9f6]" style={{ fontFamily:"'Nunito',sans-serif", paddingTop:'80px' }}>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 lg:px-12 py-3 flex items-center gap-2 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
            <Link href="/shop" className="hover:text-[#C9A84C] transition-colors">Shop</Link>
            {product.category?.parent && <>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <Link href={`/shop?category=${product.category.parent.id}`} className="hover:text-[#C9A84C] transition-colors">{product.category.parent.name}</Link>
            </>}
            {product.category && <>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <Link href={`/shop?category=${product.category.id}`} className="hover:text-[#C9A84C] transition-colors">{product.category.name}</Link>
            </>}
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>

        {/* Main */}
        <div className="container mx-auto px-6 lg:px-12 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">

            {/* Gallery */}
            <div>
              <ProductGallery images={product.images.map(i => i.url)} productName={product.name} />
            </div>

            {/* Info */}
            <div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.category && (
                  <Link href={`/shop?category=${product.category.id}`}
                    className="text-xs text-gray-500 border border-gray-200 px-3 py-1 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors uppercase tracking-wider">
                    {product.category.name}
                  </Link>
                )}
                <span className={`text-xs font-semibold px-3 py-1 ${
                  product.quantity > 10 ? 'bg-green-50 text-green-700' :
                  product.quantity > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                }`}>
                  {product.quantity > 10 ? '✓ In Stock' : product.quantity > 0 ? `Low Stock — ${product.quantity} left` : 'Out of Stock'}
                </span>
                {discount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1">-{discount}% OFF</span>}
                {product.featured && <span className="bg-[#C9A84C] text-[#111008] text-xs font-bold px-3 py-1">FEATURED</span>}
              </div>

              <h1 className="font-display text-3xl lg:text-4xl font-medium text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(avg) ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'}`} />
                  ))}
                </div>
                <a href="#reviews" className="text-sm text-gray-500 hover:text-[#C9A84C] transition-colors">
                  {product._count.reviews} review{product._count.reviews !== 1 ? 's' : ''}
                </a>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900">₦{price.toLocaleString()}</span>
                  {compareAt && <>
                    <span className="text-lg text-gray-400 line-through">₦{compareAt.toLocaleString()}</span>
                    <span className="text-sm text-green-600 font-semibold">Save ₦{(compareAt - price).toLocaleString()}</span>
                  </>}
                </div>
                <p className="text-xs text-gray-400 mt-1">Excluding VAT and delivery</p>
              </div>

              {product.shortDescription && (
                <div className="bg-white border-l-2 border-[#C9A84C] pl-4 py-2 mb-6">
                  <p className="text-gray-600 text-sm leading-relaxed">{product.shortDescription}</p>
                </div>
              )}

              {/* Quick specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: Weight, label: 'Weight', value: getWeight(product.name) },
                  { icon: Ruler, label: 'Dimensions', value: getDims(product.name) },
                  { icon: Shield, label: 'Warranty', value: '5 Years' },
                  { icon: Award, label: 'Certified', value: 'ISO, SON' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white border border-gray-100 p-3 text-center">
                    <Icon className="h-4 w-4 mx-auto mb-1.5 text-[#C9A84C]" />
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <div className="flex-1">
                  <AddToCartButton product={{ ...product, price, compareAtPrice: compareAt }} />
                </div>
                <WishlistButton productId={product.id}
                  className="w-12 h-12 border border-gray-200 hover:border-[#C9A84C] flex items-center justify-center transition-colors"
                  iconClassName="h-5 w-5" />
                <button className="w-12 h-12 border border-gray-200 hover:border-[#C9A84C] flex items-center justify-center transition-colors">
                  <Share2 className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Key features */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {features.slice(0, 4).map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-[#C9A84C] flex-shrink-0" />{text}
                  </div>
                ))}
              </div>

              {/* Stock info */}
              <div className="bg-white border border-gray-100 p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#C9A84C] flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {product.quantity > 0 ? 'Ready to ship in 24–48 hours' : 'Currently out of stock'}
                  </p>
                  <p className="text-xs text-gray-400">{product.quantity} units available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              {product.description && (
                <div className="bg-white border border-gray-100 p-7">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#C9A84C]" />Description
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {/* Features */}
              <div className="bg-[#faf9f6] border border-gray-100 p-7">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-[#C9A84C]" />Industrial Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {features.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-sm text-gray-700">
                      <Icon className="h-4 w-4 text-[#C9A84C] flex-shrink-0" />{text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div id="reviews" className="bg-white border border-gray-100 p-7">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#C9A84C]" />
                    Reviews ({product._count.reviews})
                  </h3>
                  <a href="#write-review" className="text-xs text-[#C9A84C] font-semibold hover:underline">Write a review →</a>
                </div>

                {/* Summary */}
                <div className="flex items-center gap-6 mb-6 p-4 bg-[#faf9f6] border border-gray-100">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{avg.toFixed(1)}</p>
                    <div className="flex gap-0.5 mt-1 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avg) ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(s => {
                      const count = product.reviews.filter(r => r.rating === s).length
                      const pct = product.reviews.length > 0 ? (count / product.reviews.length) * 100 : 0
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">{s} stars</span>
                          <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden">
                            <div className="h-full bg-[#C9A84C]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-8">{Math.round(pct)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {product.reviews.length > 0 ? product.reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                            {review.user.name?.charAt(0) ?? 'C'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{review.user.name ?? 'Customer'}</p>
                            <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-NG', { year:'numeric', month:'short', day:'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-[#C9A84C] fill-[#C9A84C]' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      {review.title && <p className="text-sm font-semibold text-gray-800 mb-1">{review.title}</p>}
                      {review.content && <p className="text-sm text-gray-600">{review.content}</p>}
                      {review.isVerified && (
                        <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />Verified Purchase
                        </p>
                      )}
                    </div>
                  )) : (
                    <p className="text-center text-gray-400 text-sm py-8">No reviews yet. Be the first to review!</p>
                  )}
                </div>

                <ReviewForm productId={product.id} productName={product.name} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Delivery */}
              <div className="bg-white border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#C9A84C]" />Delivery Options
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Truck, color: 'bg-green-50 text-green-600', title: 'Standard', desc: '3–5 business days', price: '₦5,000', note: 'Free on orders over ₦100,000' },
                    { icon: Zap, color: 'bg-blue-50 text-blue-600', title: 'Express', desc: '1–2 business days', price: '₦15,000', note: 'Lagos & Abuja only' },
                    { icon: Package, color: 'bg-purple-50 text-purple-600', title: 'Site Delivery', desc: 'With crane/lifter', price: '₦25,000', note: 'Bulk orders >500kg' },
                  ].map(({ icon: Icon, color, title, desc, price: p, note }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className={`${color} p-1.5 flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{title} — <span className="text-[#C9A84C]">{p}</span></p>
                        <p className="text-xs text-gray-500">{desc}</p>
                        <p className="text-xs text-gray-400">{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulk pricing */}
              <div className="bg-[#111008] p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#C9A84C]" />Bulk Pricing
                </h3>
                <div className="space-y-2">
                  {[
                    { range: '10–50 units', disc: '5%', unitPrice: Math.round(price * 0.95) },
                    { range: '51–100 units', disc: '10%', unitPrice: Math.round(price * 0.9) },
                    { range: '100+ units', disc: '15%', unitPrice: Math.round(price * 0.85) },
                  ].map(({ range, disc, unitPrice }) => (
                    <div key={range} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{range}</p>
                        <p className="text-xs text-[#C9A84C]">{disc} discount</p>
                      </div>
                      <p className="text-[#C9A84C] font-bold text-sm">₦{unitPrice.toLocaleString()}/unit</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-4">Contact us for custom quotes on large projects</p>
              </div>

              {/* Safety */}
              <div className="bg-white border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#C9A84C]" />Safety
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {['Wear appropriate PPE during installation', 'Follow manufacturer guidelines', 'Professional installation recommended',
                    ...(cat.includes('Electrical') ? ['Qualified electrician required'] : [])
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-[#C9A84C] mt-0.5 flex-shrink-0" />{item}
                    </li>
                  ))}
                  {cat.includes('Electrical') && (
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      Qualified electrician required
                    </li>
                  )}
                </ul>
              </div>

              {/* Support */}
              <div className="bg-[#111008] p-6">
                <h3 className="font-bold text-white mb-2">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">Our technical team can help with specs, installation, and bulk orders.</p>
                <div className="space-y-2">
                  <Link href="/contact" className="block w-full py-2.5 bg-[#C9A84C] hover:bg-[#b8943c] text-[#111008] font-bold text-center text-sm transition-colors">
                    Contact Support
                  </Link>
                  <Link href="/contact?quote=true" className="block w-full py-2.5 border border-gray-700 hover:bg-white/5 text-gray-300 text-center text-sm transition-colors">
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-7 h-px bg-[#C9A84C]" />
                <h2 className="font-display text-3xl font-medium text-gray-900">Related Products</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map(p => (
                  <Link key={p.id} href={`/shop/${p.slug}`}
                    className="group bg-white border border-gray-100 hover:border-[#C9A84C]/40 transition-all"
                    style={{ transition:'all 0.25s ease' }}>
                    <div className="relative aspect-square overflow-hidden bg-[#faf9f6]">
                      {p.images[0] ? (
                        <Image src={p.images[0].url} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-1">{p.category?.name}</p>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-[#C9A84C] transition-colors line-clamp-2">{p.name}</p>
                      <p className="font-bold text-gray-900 mt-2">₦{Number(p.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}