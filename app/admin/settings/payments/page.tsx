import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CreditCard, Save, AlertCircle } from 'lucide-react'

export default async function PaymentSettingsPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Payment Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Paystack */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            Paystack (Nigeria)
          </h2>
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Get your API keys from the Paystack dashboard
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Public Key</label>
              <Input defaultValue={process.env.PAYSTACK_PUBLIC_KEY || ''} placeholder="pk_live_..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secret Key</label>
              <Input type="password" defaultValue={process.env.PAYSTACK_SECRET_KEY || ''} placeholder="sk_live_..." />
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Status:</span> {process.env.PAYSTACK_SECRET_KEY ? 'Configured' : 'Not Configured'}
            </p>
          </div>
        </div>

        {/* Flutterwave */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            Flutterwave
          </h2>
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Supports multiple African currencies
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Public Key</label>
              <Input defaultValue={process.env.FLUTTERWAVE_PUBLIC_KEY || ''} placeholder="FLWPUBK-..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secret Key</label>
              <Input type="password" defaultValue={process.env.FLUTTERWAVE_SECRET_KEY || ''} placeholder="FLWSECK-..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Encryption Key</label>
              <Input type="password" defaultValue={process.env.FLUTTERWAVE_ENCRYPTION_KEY || ''} placeholder="FLWSECK-..." />
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Status:</span> {process.env.FLUTTERWAVE_SECRET_KEY ? 'Configured' : 'Not Configured'}
            </p>
          </div>
        </div>

        {/* Stripe */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" />
            Stripe (International)
          </h2>
          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            For international customers
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Publishable Key</label>
              <Input defaultValue={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''} placeholder="pk_test_..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Secret Key</label>
              <Input type="password" defaultValue={process.env.STRIPE_SECRET_KEY || ''} placeholder="sk_test_..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Webhook Secret</label>
              <Input type="password" defaultValue={process.env.STRIPE_WEBHOOK_SECRET || ''} placeholder="whsec_..." />
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Status:</span> {process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not Configured'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Payment Settings
          </Button>
        </div>
      </div>
    </div>
  )
}