'use client'

import { useRouter } from 'next/navigation'
import { LayoutGrid, Grid2X2 } from 'lucide-react'

interface ViewToggleProps {
  currentView: string
}

export function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter()

  const handleViewChange = (view: 'grid' | 'list') => {
    const url = new URL(window.location.href)
    url.searchParams.set('view', view)
    router.push(url.toString())
  }

  return (
    <div className="flex items-center gap-2 bg-accent/50 rounded-lg p-1">
      <button
        onClick={() => handleViewChange('grid')}
        className={`p-2 rounded-lg transition-colors ${
          currentView === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
      <button
        onClick={() => handleViewChange('list')}
        className={`p-2 rounded-lg transition-colors ${
          currentView === 'list' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-label="List view"
      >
        <Grid2X2 className="h-5 w-5" />
      </button>
    </div>
  )
}