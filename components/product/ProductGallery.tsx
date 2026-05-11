'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn, Package } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  const prev = () => setActive((a) => (a === 0 ? images.length - 1 : a - 1))
  const next = () => setActive((a) => (a === images.length - 1 ? 0 : a + 1))

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .gallery-fade { animation:fadeIn 0.25s ease; }
      `}</style>

      <div className="space-y-3">
        {/* Main image */}
        <div className="relative aspect-square bg-[#faf9f6] border border-gray-100 overflow-hidden group">
          {images.length > 0 ? (
            <>
              <Image
                key={active}
                src={images[active]}
                alt={`${productName} — image ${active + 1}`}
                fill
                className="object-cover gallery-fade"
                priority
              />
              {/* Zoom button */}
              <button
                onClick={() => setZoomed(true)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#C9A84C] hover:border-[#C9A84C] hover:text-white"
              >
                <ZoomIn className="h-4 w-4 text-gray-600 group-hover:text-white" />
              </button>
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Package className="h-20 w-20 text-gray-200" />
            </div>
          )}

          {/* Prev/Next */}
          {images.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#C9A84C] hover:border-[#C9A84C]">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#C9A84C] hover:border-[#C9A84C]">
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1">
              {active + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`relative w-16 h-16 flex-shrink-0 border-2 overflow-hidden transition-colors ${
                  i === active ? 'border-[#C9A84C]' : 'border-gray-100 hover:border-[#C9A84C]/50'
                }`}>
                <Image src={src} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {zoomed && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}>
          <div className="relative max-w-3xl w-full max-h-[90vh] aspect-square" onClick={e => e.stopPropagation()}>
            <Image src={images[active]} alt={productName} fill className="object-contain" />
            <button onClick={() => setZoomed(false)}
              className="absolute top-3 right-3 w-9 h-9 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors">
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}