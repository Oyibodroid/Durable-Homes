import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-gray-400">Last updated: January 2026</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8 prose prose-gray max-w-none">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">By accessing and using Durable Homes, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Products and Orders</h2>
            <p className="text-gray-600 leading-relaxed">All products are subject to availability. We reserve the right to limit quantities, refuse orders, or cancel orders at our discretion. Prices are subject to change without notice.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Payment</h2>
            <p className="text-gray-600 leading-relaxed">Payment is required at the time of order. We accept payment via Paystack and Flutterwave. All transactions are processed securely. We do not store your card details.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Delivery</h2>
            <p className="text-gray-600 leading-relaxed">Delivery times are estimates and not guaranteed. We are not liable for delays caused by circumstances beyond our control. Risk of loss passes to you upon delivery.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Returns & Refunds</h2>
            <p className="text-gray-600 leading-relaxed">You may return unused products in original packaging within 30 days of delivery for a full refund. Contact our support team to initiate a return. Shipping costs for returns are borne by the customer unless the product is defective.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">Durable Homes shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our maximum liability is limited to the amount paid for the specific order in question.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contact</h2>
            <p className="text-gray-600 leading-relaxed">For questions about these terms, contact us at <a href="mailto:legal@durablehomes.com" className="text-yellow-600 hover:underline">legal@durablehomes.com</a> or visit our <Link href="/contact" className="text-yellow-600 hover:underline">contact page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}