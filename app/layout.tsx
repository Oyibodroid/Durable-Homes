import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/shared/Providers'
import { CartProvider } from '@/components/shared/CartProvider'
import { StoreShell } from '@/components/shared/StoreShell'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'serif'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#111827',
  colorScheme: 'light',
}

export const metadata: Metadata = {
  title: {
    default: 'Durable Homes - Premium Building Materials & Construction Supplies',
    template: '%s | Durable Homes',
  },
  description:
    'Your trusted partner for premium building materials, construction supplies, interior finishes, and aesthetic solutions in Nigeria. Professional-grade quality for contractors and homeowners.',
  keywords: [
    'building materials Nigeria',
    'construction supplies',
    'cement',
    'reinforcement steel',
    'roofing materials',
    'interior finishes',
    'paints',
    'tiles',
    'plumbing fixtures',
    'electrical fittings',
    'building materials supplier Lagos',
    'construction materials Abuja',
    'bulk building materials',
    'professional construction supplies',
    'durable building materials',
  ],
  authors: [{ name: 'Durable Homes', url: 'https://durablehomes.com' }],
  creator: 'Oyibo Daniel',
  publisher: 'Durable Homes',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://durablehomes.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Durable Homes - Premium Building Materials & Construction Supplies',
    description:
      'Quality building materials, construction supplies, and interior finishes for contractors and homeowners across Nigeria.',
    url: 'https://durablehomes.com',
    siteName: 'Durable Homes',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Durable Homes - Building Materials Supplier Nigeria' }],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Durable Homes - Premium Building Materials',
    description: 'Quality construction supplies and building materials for your dream home.',
    images: ['/og-image.jpg'],
    site: '@durablehomes',
    creator: '@durablehomes',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
  category: 'construction',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://api.paystack.co" />
        <link rel="dns-prefetch" href="https://api.flutterwave.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Local business structured data */}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'Durable Homes',
              description: 'Premium building materials and construction supplies supplier in Nigeria',
              url: process.env.NEXT_PUBLIC_APP_URL,
              logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
              image: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.jpg`,
              telephone: '+234123456789',
              email: 'sales@durablehomes.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Construction Avenue',
                addressLocality: 'Ikeja',
                addressRegion: 'Lagos',
                addressCountry: 'NG',
                postalCode: '100001',
              },
              geo: { '@type': 'GeoCoordinates', latitude: '6.6018', longitude: '3.3515' },
              openingHoursSpecification: [
                { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' },
                { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '16:00' },
              ],
              priceRange: '₦₦',
              areaServed: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City'],
              paymentAccepted: ['Cash', 'Bank Transfer', 'Card', 'Paystack', 'Flutterwave'],
            }),
          }}
        />
      </head>

      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-gray-50`}>
        <Providers>
          <CartProvider>
            {/*
              StoreShell uses usePathname() — reacts instantly to client-side
              navigation without a reload. Hides Header/Footer on /admin and /auth routes.
            */}
            <StoreShell>{children}</StoreShell>
          </CartProvider>
        </Providers>

        {/* Analytics — production only */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}