import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const sections = [
  {
    title: '1. Information We Collect',
    items: [
      'Personal details you provide: name, email address, phone number, and delivery address',
      'Payment information processed securely through Paystack and Flutterwave — we never store card details',
      'Order and purchase history',
      'Usage data: pages visited, products viewed, search queries, and time spent on site',
      'Device and browser information for security and optimisation',
    ],
  },
  {
    title: '2. How We Use Your Information',
    items: [
      'Processing and fulfilling your orders and sending confirmation emails',
      'Communicating about your orders, deliveries, and account',
      'Improving our website, products, and services',
      'Sending promotional emails and offers (you can unsubscribe at any time)',
      'Detecting and preventing fraud and security issues',
      'Complying with legal obligations',
    ],
  },
  {
    title: '3. Data Sharing',
    items: [
      'We do not sell your personal data to third parties',
      'We share data only with service providers necessary to run our business (payment processors, courier services, email platforms)',
      'All third-party providers are bound by data processing agreements',
      'We may disclose data if required by law or to protect our rights',
    ],
  },
  {
    title: '4. Data Security',
    items: [
      'All data is transmitted using industry-standard TLS/HTTPS encryption',
      'Passwords are hashed using bcrypt and never stored in plain text',
      'Payment processing is handled by PCI-DSS compliant providers',
      'We conduct regular security reviews',
    ],
  },
  {
    title: '5. Cookies',
    items: [
      'Essential cookies: required for authentication and cart functionality',
      'Analytics cookies: help us understand how the site is used (anonymised)',
      'You can disable cookies in your browser settings, though some features may not function correctly',
    ],
  },
  {
    title: '6. Your Rights',
    items: [
      'Right to access the personal data we hold about you',
      'Right to correct inaccurate or incomplete data',
      'Right to delete your account and associated data',
      'Right to opt out of marketing communications',
      'To exercise any of these rights, contact privacy@durablehomes.com',
    ],
  },
  {
    title: '7. Data Retention',
    items: [
      'Account data is retained for as long as your account is active',
      'Order records are retained for 7 years for legal and tax purposes',
      'You may request deletion of your account at any time',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@300;400;500;600&display=swap');
        .font-display { font-family:'Cormorant Garamond',serif; }
        .hex-bg { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill='%23C9A84C' fill-opacity='0.055'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/g%3E%3C/svg%3E"); }
      `}</style>

      <div className="min-h-screen bg-[#faf9f6]" style={{ fontFamily:"'Nunito',sans-serif", paddingTop:'80px' }}>
        <div className="bg-[#111008] hex-bg py-14">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
              <Link href="/" className="hover:text-[#C9A84C] transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#C9A84C]">Privacy Policy</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-px bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.22em] uppercase font-semibold">Legal</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl text-white font-medium">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mt-3">Last updated: January 2026</p>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 py-16">
          <div className="max-w-3xl">
            <div className="bg-white border border-gray-100 p-4 mb-10 flex items-start gap-3">
              <div className="w-1 self-stretch bg-[#C9A84C] flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">
                Your privacy matters to us. This policy explains what data we collect, how we use it,
                and the choices you have. We keep this straightforward and honest.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.title} className="border-b border-gray-100 pb-8 last:border-0">
                  <h2 className="font-semibold text-gray-900 mb-4">{section.title}</h2>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">
                Questions about your data? Email{' '}
                <a href="mailto:privacy@durablehomes.com" className="text-[#C9A84C] hover:underline">
                  privacy@durablehomes.com
                </a>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/terms" className="text-sm text-[#C9A84C] font-medium hover:underline">Terms of Service →</Link>
                <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Contact Us →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}