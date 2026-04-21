'use client'

import { Button } from '@/components/ui/Button'
import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4 mr-2" />
      Print Invoice
    </Button>
  )
}