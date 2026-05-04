import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using Durable Homes, you accept and agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any of these terms, you are prohibited from using this site.',
  },
  {
    title: '2. Products and Availability',
    content: 'All products are subject to availability. We reserve the right to limit quantities, refuse orders, or discontinue products at our discretion. Product images are for illustration purposes — actual products may differ slightly in appearance.',
  },
  {
    title: '3. Pricing and Payment',
    content: 'Prices are listed in Nigerian Naira (₦) and are subject to change without notice. Payment is required in full at the time of order. We accept payment via Paystack and Flutterwave. All transactions are encrypted and processed securely.',
  },
  {
    title: '4. Delivery',
    content: 'Delivery timeframes are estimates and not guaranteed. We are not liable for delays caused by circumstances beyond our control including traffic, weather, or logistical disruptions. Risk of loss passes to you upon delivery to your specified address.',
  },
  {
    title: '5. Returns and Refunds',
    content: 'You may return unused products in original, undamaged packaging within 30 days of delivery for a full refund. To initiate a return, contact our support team. Return shipping costs are the responsibility of the customer unless the item is defective or incorrectly supplied.',
  },
  {
    title: '6. Warranty',
    content: 'Products carry manufacturer warranties where applicable. Durable Homes does not provide additional warranties beyond those offered by manufacturers. Warranty claims must be directed to the manufacturer with proof of purchase.',
  },
  {
    title: '7. Limitation of Liability',
    content: 'Durable Homes shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our maximum liability is limited to the purchase price of the specific order in question.',
  },
  {
    title: '8. Intellectual Property',
    content: 'All content on this site including text, images, logos, and design is the property of Durable Homes and protected by applicable copyright laws. You may not reproduce or distribute any content without written permission.',
  },
  {
    title: '9. Changes to Terms',
    content: 'We reserve the right to update these terms at any time. Continued use of the site following any changes constitutes acceptance of the new terms. We recommend checking this page periodically.',
  },
  {
    title: '10. Contact',
    content: 'For questions about these terms, contact us at legal@durablehomes.com or visit our contact page.',
  },
]

export default function TermsPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@300;400;500;600&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
      `}</style>

      <div className="min-h-screen bg-[#faf9f6]" style={{ fontFamily:"'Nunito',sans-serif", paddingTop:'80px' }}>
        {/* Header */}
        <div className="bg-[#111008] hex-bg py-14">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
              <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#C9A84C]">Terms of Service</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Legal</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl text-white font-medium">Terms of Service</h1>
            <p className="text-gray-500 text-sm mt-3">Last updated: January 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="max-w-3xl">
            <div className="bg-white border border-gray-100 p-4 mb-10 flex items-start gap-3">
              <div className="w-1 self-stretch bg-[#C9A84C] flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">
                Please read these Terms of Service carefully before using the Durable Homes website.
                These terms govern your use of our platform and the purchase of products.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.title} className="border-b border-gray-100 pb-8 last:border-0">
                  <h2 className="font-semibold text-gray-900 mb-3">{section.title}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {section.content}
                    {section.title === '10. Contact' && (
                      <> Visit our <Link href="/contact" className="text-[#C9A84C] hover:underline">contact page</Link>.</>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
              <Link href="/privacy" className="text-sm text-[#C9A84C] font-medium hover:underline">Privacy Policy →</Link>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Contact Us →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}