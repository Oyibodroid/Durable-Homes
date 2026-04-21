import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: January 2026</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8 prose prose-gray max-w-none">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">We collect information you provide directly: name, email, phone number, delivery address, and payment information. We also collect usage data including pages visited, products viewed, and purchase history.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="text-gray-600 space-y-2 list-disc pl-5">
              <li>To process and fulfil your orders</li>
              <li>To send order confirmations and updates</li>
              <li>To respond to your enquiries</li>
              <li>To improve our products and services</li>
              <li>To send promotional emails (you can unsubscribe at any time)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">We do not sell your personal data. We share data only with service providers necessary to operate our business (payment processors, delivery services). All third parties are bound by confidentiality agreements.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">We use industry-standard encryption and security measures. Passwords are hashed and never stored in plain text. Payment processing is handled by PCI-compliant providers — we never store card numbers.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">We use essential cookies for authentication and cart functionality. We use analytics cookies to understand how our site is used. You can disable cookies in your browser settings, though some features may not work correctly.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:privacy@durablehomes.com" className="text-yellow-600 hover:underline">privacy@durablehomes.com</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact</h2>
            <p className="text-gray-600 leading-relaxed">Questions about this policy? Visit our <Link href="/contact" className="text-yellow-600 hover:underline">contact page</Link> or email <a href="mailto:privacy@durablehomes.com" className="text-yellow-600 hover:underline">privacy@durablehomes.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}