'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Crown, Sparkles, Gem, Star, Heart, Building2, MoveRight } from 'lucide-react'

interface HeroCarouselProps {
  stats: {
    products: number
    categories: number
    orders: number
    rating: number
  }
}

export function HeroCarousel({ stats }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const heroImages = [
    {
      url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=80",
      title: "Premium Cement & Blocks",
      subtitle: "Foundation for your dream home"
    },
    {
      url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80",
      title: "Quality Steel Reinforcement",
      subtitle: "Strength that lasts generations"
    },
    {
      url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80",
      title: "Modern Roofing Solutions",
      subtitle: "Protect your investment"
    },
    {
      url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1920&q=80",
      title: "Premium Paints & Finishes",
      subtitle: "Bring your vision to life"
    },
    {
      url: "https://images.unsplash.com/photo-1586105261999-e2dc950bb6b2?w=1920&q=80",
      title: "Elegant Flooring & Tiles",
      subtitle: "Beauty meets durability"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Rotating Background Images */}
      <div className="absolute inset-0 overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Image Caption */}
            <div className="absolute bottom-20 left-0 right-0 text-center text-white animate-fade-in-up">
              <p className="text-sm uppercase tracking-wider text-amber-400 mb-2">{image.subtitle}</p>
              <p className="text-2xl md:text-3xl font-bold">{image.title}</p>
            </div>
          </div>
        ))}
        
        {/* Carousel Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-amber-500' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content Overlay */}
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-full mb-6 shadow-sm animate-fade-in-up">
            <Crown className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-white">Premium Building Materials</span>
            <Sparkles className="h-3 w-3 text-amber-400" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg animate-fade-in-up animation-delay-200">
            Build Your Dream{' '}
            <span className="text-amber-400">with Excellence</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow animate-fade-in-up animation-delay-400">
            Premium building materials, elegant finishes, and expert solutions for 
            discerning homeowners and professionals across Nigeria.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in-up animation-delay-600">
            <Link href="/shop">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                Explore Collection
                <MoveRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 px-8">
                Contact Experts
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto animate-fade-in-up animation-delay-800">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gem className="h-5 w-5 text-amber-400" />
                <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                  {stats.products}+
                </p>
              </div>
              <p className="text-sm text-white/80">Premium Products</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-amber-400" />
                <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                  {stats.rating}
                </p>
              </div>
              <p className="text-sm text-white/80">Customer Rating</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-amber-400" />
                <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                  {stats.orders}+
                </p>
              </div>
              <p className="text-sm text-white/80">Projects Done</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-amber-400" />
                <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                  {stats.categories}
                </p>
              </div>
              <p className="text-sm text-white/80">Expert Categories</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}