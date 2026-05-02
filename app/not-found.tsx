'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { 
  HardHat, 
  Package, 
  Truck, 
  Home, 
  ArrowLeft,
  Search,
  Hammer,
  Paintbrush,
  Ruler
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const suggestions = [
    { name: 'Structural Materials', href: '/shop?category=structural', icon: HardHat },
    { name: 'Interior Finishes', href: '/shop?category=finishes', icon: Paintbrush },
    { name: 'Flooring & Tiles', href: '/shop?category=flooring', icon: Ruler },
    { name: 'Tools & Equipment', href: '/shop?category=tools', icon: Hammer },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Industrial Header Decoration */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-6">
            <HardHat className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">Error 404</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">404</h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">Page Not Found</p>
          <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500"></div>
      </div>

      {/* Main Content - Properly Centered */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Construction Worker Illustration */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl"></div>
              <div className="relative bg-white rounded-full p-8 shadow-lg border-4 border-gray-200">
                <HardHat className="h-24 w-24 text-yellow-500" />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                Under Construction
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! This Page is Still Under Construction
            </h2>
            <p className="text-gray-600">
              It seems you've stumbled upon a page that hasn't been built yet. 
              While our construction crew works on it, here are some materials you might find useful:
            </p>
          </div>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon
              return (
                <Link
                  key={suggestion.name}
                  href={suggestion.href}
                  className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-yellow-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500 transition-colors">
                    <Icon className="h-6 w-6 text-yellow-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">
                    {suggestion.name}
                  </h3>
                  <p className="text-sm text-gray-500">Browse materials</p>
                </Link>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 transition-all duration-300 hover:scale-105">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="border-gray-300 hover:border-yellow-500 transition-all duration-300 hover:scale-105">
                <Package className="mr-2 h-4 w-4" />
                Browse Products
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-gray-300 hover:border-yellow-500 transition-all duration-300 hover:scale-105">
                <Truck className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <form action="/shop" method="GET" className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search for building materials..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Popular Categories Section */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-center text-gray-600 mb-6">Popular Categories</h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {['Cement', 'Reinforcement Steel', 'Roofing Sheets', 'Paints', 'Tiles', 'Plumbing', 'Electrical', 'Doors'].map((cat) => (
              <Link
                key={cat}
                href={`/shop?q=${cat.toLowerCase()}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-yellow-500 hover:text-yellow-600 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">
          Need immediate assistance? Our team is ready to help.
        </p>
        <Link href="/contact" className="text-yellow-600 hover:text-yellow-700 font-medium inline-flex items-center gap-1">
          Contact Support
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Link>
      </div>

      {/* Add animations styles */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-100 {
          animation-delay: 100ms;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  )
}