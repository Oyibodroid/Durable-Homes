'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavbarProps {
  mobile?: boolean
  onItemClick?: () => void
}

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar({ mobile, onItemClick }: NavbarProps) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      "flex",
      mobile ? "flex-col space-y-2" : "items-center space-x-6"
    )}>
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onItemClick}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-foreground"
              : "text-foreground/60",
            mobile && "block py-2"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}