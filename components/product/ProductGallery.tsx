'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[] | null | undefined
  productName: string
}

export function ProductGallery({ images = [], productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  // Provide a default empty array if images is undefined/null
  const safeImages = images || []
  const hasImages = safeImages.length > 0

  if (!hasImages) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-2">
        <span className="text-4xl">🏠</span>
        <p className="text-sm text-muted-foreground">No image available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-4 overflow-auto lg:max-h-[600px]">
        {safeImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={cn(
              "relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors",
              selectedImage === index 
                ? "border-primary" 
                : "border-transparent hover:border-gray-300"
            )}
          >
            <Image
              src={image}
              alt={`${productName} - View ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div 
        className="flex-1 aspect-square relative rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={safeImages[selectedImage]}
          alt={productName}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={cn(
            "object-cover transition-transform duration-300",
            isZoomed && "scale-150"
          )}
          priority
        />
      </div>
    </div>
  )
}