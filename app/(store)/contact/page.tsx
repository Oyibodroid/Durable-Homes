'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Message sent! We'll get back to you within 24 hours.")
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    setIsLoading(false)
  }

  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '+234 123 456 7890', href: 'tel:+2341234567890' },
    { icon: Mail, label: 'Email', value: 'sales@durablehomes.com', href: 'mailto:sales@durablehomes.com' },
    { icon: MapPin, label: 'Address', value: '123 Construction Avenue, Ikeja, Lagos', href: 'https://maps.google.com' },
    { icon: Clock, label: 'Hours', value: 'Mon–Fri 8am–6pm · Sat 9am–4pm', href: null },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Have a question or need a bulk quote? Our team is ready to help.</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Get in Touch</h2>
            {contactInfo.map((item) => {
              const Icon = item.icon
              const content = (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{item.label}</p>
                    <p className="text-gray-900 font-medium">{item.value}</p>
                  </div>
                </div>
              )
              return item.href ? (
                <a key={item.label} href={item.href} className="block hover:opacity-80 transition-opacity">{content}</a>
              ) : (
                <div key={item.label}>{content}</div>
              )
            })}
            <div className="bg-gray-900 text-white rounded-xl p-6 mt-8">
              <h3 className="font-bold mb-2">Bulk Orders & Quotes</h3>
              <p className="text-gray-400 text-sm leading-relaxed">For project-scale orders, our sales team can prepare a detailed quote within 24 hours.</p>
              <a href="mailto:sales@durablehomes.com" className="mt-4 inline-block text-yellow-400 text-sm font-medium hover:text-yellow-300">Request a quote →</a>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <Input id="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+234 000 000 0000" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select id="subject" value={formData.subject} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    <option value="">Select a subject</option>
                    <option value="product-inquiry">Product Inquiry</option>
                    <option value="bulk-order">Bulk Order / Quote</option>
                    <option value="order-support">Order Support</option>
                    <option value="delivery">Delivery Question</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea id="message" value={formData.message} onChange={handleChange} rows={5} required placeholder="Tell us how we can help..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none" />
              </div>
              <Button type="submit" loading={isLoading} className="bg-gray-900 hover:bg-gray-800 text-white px-8">
                <Send className="h-4 w-4 mr-2" />Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}