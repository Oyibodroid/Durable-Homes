'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { Store, Truck, Receipt, Bell, Shield, Save } from 'lucide-react'
import type { StoreSettings } from '@/lib/settings'

interface SettingsFormProps {
  initialSettings: StoreSettings
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5 ml-11">{description}</p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500'

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<StoreSettings>(initialSettings)
  const [saving, setSaving] = useState<string | null>(null)

  const update = (key: keyof StoreSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSection = async (keys: (keyof StoreSettings)[]) => {
    const sectionKey = keys[0]
    setSaving(sectionKey)

    const payload = Object.fromEntries(keys.map((k) => [k, settings[k]]))

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(null)
    }
  }

  // ── Store Info ─────────────────────────────────────────────────────────────
  const storeInfoKeys: (keyof StoreSettings)[] = [
    'storeName', 'storeEmail', 'storePhone',
    'storeAddress', 'storeCity', 'storeState', 'storeCountry',
  ]

  // ── Shipping ───────────────────────────────────────────────────────────────
  const shippingKeys: (keyof StoreSettings)[] = [
    'shippingFreeThreshold', 'shippingBaseRate', 'shippingExpressRate',
  ]

  // ── Tax ───────────────────────────────────────────────────────────────────
  const taxKeys: (keyof StoreSettings)[] = ['taxRate', 'taxEnabled']

  // ── Notifications ─────────────────────────────────────────────────────────
  const notificationKeys: (keyof StoreSettings)[] = [
    'adminNotificationEmail', 'lowStockThreshold', 'lowStockAlerts',
  ]

  // ── Maintenance ───────────────────────────────────────────────────────────
  const maintenanceKeys: (keyof StoreSettings)[] = [
    'maintenanceMode', 'maintenanceMessage',
  ]

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Store Information */}
      <Section icon={Store} title="Store Information" description="Your store's public-facing details used in emails and invoices.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Store Name">
            <input className={inputClass} value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} />
          </Field>
          <Field label="Store Email">
            <input className={inputClass} type="email" value={settings.storeEmail} onChange={(e) => update('storeEmail', e.target.value)} />
          </Field>
          <Field label="Phone Number">
            <input className={inputClass} type="tel" value={settings.storePhone} onChange={(e) => update('storePhone', e.target.value)} />
          </Field>
          <Field label="Country">
            <select className={inputClass} value={settings.storeCountry} onChange={(e) => update('storeCountry', e.target.value)}>
              <option value="NG">Nigeria</option>
              <option value="GH">Ghana</option>
              <option value="KE">Kenya</option>
              <option value="ZA">South Africa</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
            </select>
          </Field>
        </div>
        <Field label="Street Address">
          <input className={inputClass} value={settings.storeAddress} onChange={(e) => update('storeAddress', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City">
            <input className={inputClass} value={settings.storeCity} onChange={(e) => update('storeCity', e.target.value)} />
          </Field>
          <Field label="State">
            <input className={inputClass} value={settings.storeState} onChange={(e) => update('storeState', e.target.value)} />
          </Field>
        </div>
        <Button
          onClick={() => saveSection(storeInfoKeys)}
          loading={saving === 'storeName'}
          className="bg-gray-900 hover:bg-gray-800 text-white mt-2"
        >
          <Save className="h-4 w-4 mr-2" />Save Store Info
        </Button>
      </Section>

      {/* Shipping */}
      <Section icon={Truck} title="Shipping" description="Set delivery rates and free shipping thresholds.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Free Shipping Threshold (₦)" hint="Orders above this amount get free shipping">
            <input className={inputClass} type="number" min="0" value={settings.shippingFreeThreshold} onChange={(e) => update('shippingFreeThreshold', e.target.value)} />
          </Field>
          <Field label="Standard Shipping (₦)" hint="Default delivery cost">
            <input className={inputClass} type="number" min="0" value={settings.shippingBaseRate} onChange={(e) => update('shippingBaseRate', e.target.value)} />
          </Field>
          <Field label="Express Shipping (₦)" hint="1-2 day delivery cost">
            <input className={inputClass} type="number" min="0" value={settings.shippingExpressRate} onChange={(e) => update('shippingExpressRate', e.target.value)} />
          </Field>
        </div>
        <Button
          onClick={() => saveSection(shippingKeys)}
          loading={saving === 'shippingFreeThreshold'}
          className="bg-gray-900 hover:bg-gray-800 text-white mt-2"
        >
          <Save className="h-4 w-4 mr-2" />Save Shipping
        </Button>
      </Section>

      {/* Tax */}
      <Section icon={Receipt} title="Tax" description="Configure VAT rate applied at checkout.">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.taxEnabled === 'true'}
              onChange={(e) => update('taxEnabled', e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm font-medium text-gray-700">Enable VAT</span>
          </label>
        </div>
        <Field label="VAT Rate (%)" hint="Applied to all orders when VAT is enabled">
          <input
            className={`${inputClass} max-w-[160px]`}
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={settings.taxRate}
            onChange={(e) => update('taxRate', e.target.value)}
            disabled={settings.taxEnabled !== 'true'}
          />
        </Field>
        <Button
          onClick={() => saveSection(taxKeys)}
          loading={saving === 'taxRate'}
          className="bg-gray-900 hover:bg-gray-800 text-white mt-2"
        >
          <Save className="h-4 w-4 mr-2" />Save Tax Settings
        </Button>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications" description="Configure where admin alerts are sent.">
        <Field label="Admin Notification Email" hint="Receives new order alerts and low stock warnings">
          <input
            className={inputClass}
            type="email"
            placeholder="admin@yourstore.com"
            value={settings.adminNotificationEmail}
            onChange={(e) => update('adminNotificationEmail', e.target.value)}
          />
        </Field>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.lowStockAlerts === 'true'}
              onChange={(e) => update('lowStockAlerts', e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm font-medium text-gray-700">Enable low stock alerts</span>
          </label>
        </div>
        <Field label="Low Stock Threshold" hint="Alert when product quantity falls below this number">
          <input
            className={`${inputClass} max-w-[160px]`}
            type="number"
            min="1"
            value={settings.lowStockThreshold}
            onChange={(e) => update('lowStockThreshold', e.target.value)}
            disabled={settings.lowStockAlerts !== 'true'}
          />
        </Field>
        <Button
          onClick={() => saveSection(notificationKeys)}
          loading={saving === 'adminNotificationEmail'}
          className="bg-gray-900 hover:bg-gray-800 text-white mt-2"
        >
          <Save className="h-4 w-4 mr-2" />Save Notifications
        </Button>
      </Section>

      {/* Maintenance Mode */}
      <Section icon={Shield} title="Maintenance Mode" description="Take your store offline temporarily while you make updates.">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode === 'true'}
              onChange={(e) => update('maintenanceMode', e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 accent-yellow-500"
            />
            <span className="text-sm font-medium text-gray-700">Enable maintenance mode</span>
          </label>
          {settings.maintenanceMode === 'true' && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              Store is offline
            </span>
          )}
        </div>
        <Field label="Maintenance Message" hint="Shown to visitors when maintenance mode is active">
          <textarea
            className={inputClass}
            rows={3}
            value={settings.maintenanceMessage}
            onChange={(e) => update('maintenanceMessage', e.target.value)}
          />
        </Field>
        <Button
          onClick={() => saveSection(maintenanceKeys)}
          loading={saving === 'maintenanceMode'}
          className={`mt-2 ${settings.maintenanceMode === 'true' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
        >
          <Save className="h-4 w-4 mr-2" />Save Maintenance Settings
        </Button>
      </Section>

      {/* Payment Keys — read-only info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Payment Keys</p>
            <p className="text-sm text-amber-700 mt-1">
              Paystack and Flutterwave API keys are managed via environment variables in your{' '}
              <code className="bg-amber-100 px-1 rounded">.env</code> file for security.
              Never store payment keys in the database.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}