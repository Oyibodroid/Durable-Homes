'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Slider } from '@/components/ui/Slider'
import { Category } from '@prisma/client'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'

interface ProductFiltersProps {
  categories: Category[]
  minPrice: number
  maxPrice: number
}

export function ProductFilters({ categories, minPrice, maxPrice }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('minPrice')) || minPrice,
    Number(searchParams.get('maxPrice')) || maxPrice,
  ])
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams)
    if (category && category !== 'all') params.set('category', category)
    else params.delete('category')
    if (priceRange[0] > minPrice) params.set('minPrice', priceRange[0].toString())
    else params.delete('minPrice')
    if (priceRange[1] < maxPrice) params.set('maxPrice', priceRange[1].toString())
    else params.delete('maxPrice')
    if (sort && sort !== 'newest') params.set('sort', sort)
    else params.delete('sort')
    params.set('page', '1')
    router.push(`/shop?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setCategory('all')
    setPriceRange([minPrice, maxPrice])
    setSort('newest')
    router.push('/shop')
  }

  const hasActiveFilters =
    category !== 'all' ||
    priceRange[0] > minPrice ||
    priceRange[1] < maxPrice ||
    sort !== 'newest'

  const FilterContent = () => (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider font-medium"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Sort */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest">
          Sort By
        </h4>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest">
          Category
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => setCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              category === 'all'
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                category === cat.id
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-widest">
          Price Range
        </h4>
        <div className="px-1">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={500}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Min (₦)</p>
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="h-8 text-sm"
              min={minPrice}
              max={priceRange[1]}
            />
          </div>
          <div className="mt-4 text-muted-foreground text-xs">—</div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Max (₦)</p>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="h-8 text-sm"
              min={priceRange[0]}
              max={maxPrice}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          ₦{priceRange[0].toLocaleString('en-NG')} — ₦{priceRange[1].toLocaleString('en-NG')}
        </p>
      </div>

      {/* Apply */}
      <Button
        onClick={updateFilters}
        className="w-full uppercase tracking-wider text-xs font-semibold"
      >
        Apply Filters
        {hasActiveFilters && (
          <span className="ml-2 bg-primary-foreground/20 text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
            !
          </span>
        )}
      </Button>
    </div>
  )

  return (
    <>
      {/* ── Mobile Toggle ── */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-card text-foreground text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Filters & Sort
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
            )}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isOpen && (
          <div className="mt-3 p-5 border border-border rounded-lg bg-card">
            <FilterContent />
          </div>
        )}
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-24 p-5 border border-border rounded-lg bg-card">
          <FilterContent />
        </div>
      </aside>
    </>
  )
}