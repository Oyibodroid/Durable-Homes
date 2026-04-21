'use client'

import { useRouter } from 'next/navigation'

interface SortDropdownProps {
  currentSort: string
}

export function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter()

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href)
    url.searchParams.set('sort', e.target.value)
    router.push(url.toString())
  }

  return (
    <select
      className="bg-accent/50 border-0 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary"
      defaultValue={currentSort || 'newest'}
      onChange={handleSortChange}
    >
      <option value="newest">Newest First</option>
      <option value="popular">Most Popular</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name-asc">Name: A to Z</option>
      <option value="name-desc">Name: Z to A</option>
    </select>
  )
}