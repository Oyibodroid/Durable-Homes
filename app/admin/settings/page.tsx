import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSettings } from '@/lib/settings'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { Settings, Store, Truck, Receipt, Bell, Shield, CreditCard } from 'lucide-react'

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const settings = await getSettings()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your store preferences, shipping, tax, and notifications.
        </p>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Store,      label: 'Store Info',     href: '#store' },
          { icon: Truck,      label: 'Shipping',        href: '#shipping' },
          { icon: Receipt,    label: 'Tax',             href: '#tax' },
          { icon: Bell,       label: 'Notifications',   href: '#notifications' },
          { icon: Shield,     label: 'Maintenance',     href: '#maintenance' },
          { icon: CreditCard, label: 'Payments',        href: '#payments' },
        ].map(({ icon: Icon, label, href }) => (
          <a key={label} href={href}
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 hover:border-[#C9A84C]/40 p-4 transition-all group">
            <div className="w-9 h-9 bg-[#C9A84C]/8 flex items-center justify-center group-hover:bg-[#C9A84C]/15 transition-colors">
              <Icon className="h-4 w-4 text-[#C9A84C]" />
            </div>
            <p className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors text-center leading-tight">
              {label}
            </p>
          </a>
        ))}
      </div>

      {/* All settings forms */}
      <SettingsForm initialSettings={settings} />
    </div>
  )
}