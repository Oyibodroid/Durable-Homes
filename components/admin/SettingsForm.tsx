'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/Toast'
import {
  Store, Truck, Receipt, Bell, Shield, CreditCard,
  Save, CheckCircle, AlertTriangle, ExternalLink,
} from 'lucide-react'
import type { StoreSettings } from '@/lib/settings'

interface Props { initialSettings: StoreSettings }

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors bg-white text-gray-900 placeholder-gray-400'

const selectCls =
  'w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors bg-white text-gray-900'

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
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function SectionHeader({
  id,
  icon: Icon,
  title,
  description,
}: {
  id: string
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div id={id} className="flex items-start gap-4 mb-6 pb-5 border-b border-gray-100">
      <div className="w-10 h-10 bg-[#C9A84C]/8 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-[#C9A84C]" />
      </div>
      <div>
        <h2 className="font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 bg-[#111008] hover:bg-[#C9A84C] text-white hover:text-[#111008] font-bold px-6 py-2.5 text-sm transition-all disabled:opacity-60"
    >
      {loading ? (
        <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Saving…</>
      ) : (
        <><Save className="h-4 w-4" />Save Changes</>
      )}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SettingsForm({ initialSettings }: Props) {
  const [s, setS] = useState<StoreSettings>(initialSettings)
  const [saving, setSaving] = useState<string | null>(null)

  const up = (key: keyof StoreSettings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setS(prev => ({ ...prev, [key]: e.target.value }))

  const toggle = (key: keyof StoreSettings) => () =>
    setS(prev => ({ ...prev, [key]: prev[key] === 'true' ? 'false' : 'true' }))

  const save = async (sectionId: string, keys: (keyof StoreSettings)[]) => {
    setSaving(sectionId)
    const payload = Object.fromEntries(keys.map(k => [k, s[k]]))
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(null)
    }
  }

  const Toggle = ({ field, label }: { field: keyof StoreSettings; label: string }) => (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={toggle(field)}
        className={`relative w-11 h-6 transition-colors flex-shrink-0 ${
          s[field] === 'true' ? 'bg-[#C9A84C]' : 'bg-gray-200'
        }`}
        style={{ cursor: 'pointer' }}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white transition-transform ${
          s[field] === 'true' ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </div>
      <span className="text-sm text-gray-700 font-medium select-none">{label}</span>
    </label>
  )

  return (
    <div className="space-y-6">

      {/* ── Store Information ─────────────────────────────────────────────── */}
      <form
        onSubmit={e => { e.preventDefault(); save('store', ['storeName','storeEmail','storePhone','storeAddress','storeCity','storeState','storeCountry']) }}
        className="bg-white border border-gray-100 p-6"
      >
        <SectionHeader
          id="store"
          icon={Store}
          title="Store Information"
          description="Public-facing details shown in emails, invoices, and the storefront."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Store Name">
            <input className={inputCls} value={s.storeName} onChange={up('storeName')} placeholder="Durable Homes" />
          </Field>
          <Field label="Store Email">
            <input className={inputCls} type="email" value={s.storeEmail} onChange={up('storeEmail')} placeholder="sales@durablehomes.com" />
          </Field>
          <Field label="Phone Number">
            <input className={inputCls} type="tel" value={s.storePhone} onChange={up('storePhone')} placeholder="+234 000 000 0000" />
          </Field>
          <Field label="Country">
            <select className={selectCls} value={s.storeCountry} onChange={up('storeCountry')}>
              <option value="NG">Nigeria</option>
              <option value="GH">Ghana</option>
              <option value="KE">Kenya</option>
              <option value="ZA">South Africa</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
            </select>
          </Field>
          <Field label="Street Address" hint="Used in invoices and legal documents">
            <input className={inputCls} value={s.storeAddress} onChange={up('storeAddress')} placeholder="123 Construction Avenue" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input className={inputCls} value={s.storeCity} onChange={up('storeCity')} placeholder="Ikeja" />
            </Field>
            <Field label="State">
              <input className={inputCls} value={s.storeState} onChange={up('storeState')} placeholder="Lagos" />
            </Field>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-50 flex justify-end">
          <SaveButton loading={saving === 'store'} />
        </div>
      </form>

      {/* ── Shipping ─────────────────────────────────────────────────────── */}
      <form
        onSubmit={e => { e.preventDefault(); save('shipping', ['shippingFreeThreshold','shippingBaseRate','shippingExpressRate']) }}
        className="bg-white border border-gray-100 p-6"
      >
        <SectionHeader
          id="shipping"
          icon={Truck}
          title="Shipping Rates"
          description="Set delivery costs and the order value that qualifies for free shipping."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="Free Shipping Threshold (₦)" hint="Orders above this get free shipping">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
              <input className={inputCls + ' pl-7'} type="number" min="0" step="1000"
                value={s.shippingFreeThreshold} onChange={up('shippingFreeThreshold')} />
            </div>
          </Field>
          <Field label="Standard Rate (₦)" hint="Default delivery cost">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
              <input className={inputCls + ' pl-7'} type="number" min="0" step="500"
                value={s.shippingBaseRate} onChange={up('shippingBaseRate')} />
            </div>
          </Field>
          <Field label="Express Rate (₦)" hint="1–2 day delivery cost">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>
              <input className={inputCls + ' pl-7'} type="number" min="0" step="500"
                value={s.shippingExpressRate} onChange={up('shippingExpressRate')} />
            </div>
          </Field>
        </div>

        {/* Preview */}
        <div className="mt-5 bg-[#faf9f6] border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Preview</p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-white border border-gray-100 p-3">
              <p className="text-xs text-gray-400 mb-1">Free shipping above</p>
              <p className="font-bold text-gray-900">₦{Number(s.shippingFreeThreshold || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-100 p-3">
              <p className="text-xs text-gray-400 mb-1">Standard delivery</p>
              <p className="font-bold text-gray-900">₦{Number(s.shippingBaseRate || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-100 p-3">
              <p className="text-xs text-gray-400 mb-1">Express delivery</p>
              <p className="font-bold text-gray-900">₦{Number(s.shippingExpressRate || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-50 flex justify-end">
          <SaveButton loading={saving === 'shipping'} />
        </div>
      </form>

      {/* ── Tax ──────────────────────────────────────────────────────────── */}
      <form
        onSubmit={e => { e.preventDefault(); save('tax', ['taxEnabled','taxRate']) }}
        className="bg-white border border-gray-100 p-6"
      >
        <SectionHeader
          id="tax"
          icon={Receipt}
          title="Tax (VAT)"
          description="Configure the VAT rate applied at checkout. Displayed separately to customers."
        />

        <div className="space-y-5">
          <Toggle field="taxEnabled" label="Enable VAT on all orders" />

          <div className={`transition-opacity ${s.taxEnabled === 'true' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <Field label="VAT Rate (%)" hint="Applied to order subtotal">
              <div className="relative max-w-[200px]">
                <input
                  className={inputCls}
                  type="number" min="0" max="100" step="0.5"
                  value={s.taxRate}
                  onChange={up('taxRate')}
                  disabled={s.taxEnabled !== 'true'}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
            </Field>
          </div>

          {s.taxEnabled === 'true' && (
            <div className="bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                VAT of <strong>{s.taxRate}%</strong> will be added to every order at checkout.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-gray-50 flex justify-end">
          <SaveButton loading={saving === 'tax'} />
        </div>
      </form>

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <form
        onSubmit={e => { e.preventDefault(); save('notifications', ['adminNotificationEmail','lowStockAlerts','lowStockThreshold']) }}
        className="bg-white border border-gray-100 p-6"
      >
        <SectionHeader
          id="notifications"
          icon={Bell}
          title="Notifications"
          description="Configure where admin alerts are sent for new orders and low stock warnings."
        />

        <div className="space-y-5">
          <Field label="Admin Notification Email" hint="Receives new order alerts and low stock warnings">
            <input
              className={inputCls + ' max-w-sm'}
              type="email"
              placeholder="admin@yourstore.com"
              value={s.adminNotificationEmail}
              onChange={up('adminNotificationEmail')}
            />
          </Field>

          <div className="pt-2 border-t border-gray-50">
            <Toggle field="lowStockAlerts" label="Enable low stock alerts" />
          </div>

          <div className={`transition-opacity ${s.lowStockAlerts === 'true' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <Field label="Low Stock Threshold" hint="Alert when product quantity falls below this number">
              <input
                className={inputCls + ' max-w-[160px]'}
                type="number" min="1" max="1000"
                value={s.lowStockThreshold}
                onChange={up('lowStockThreshold')}
                disabled={s.lowStockAlerts !== 'true'}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-50 flex justify-end">
          <SaveButton loading={saving === 'notifications'} />
        </div>
      </form>

      {/* ── Maintenance Mode ──────────────────────────────────────────────── */}
      <form
        onSubmit={e => { e.preventDefault(); save('maintenance', ['maintenanceMode','maintenanceMessage']) }}
        className="bg-white border border-gray-100 p-6"
      >
        <SectionHeader
          id="maintenance"
          icon={Shield}
          title="Maintenance Mode"
          description="Take your store offline temporarily while you make updates. Admins can still access the site."
        />

        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-[#faf9f6] border border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">Enable Maintenance Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">Visitors will see the maintenance page instead of the store</p>
            </div>
            <Toggle field="maintenanceMode" label="" />
          </div>

          {s.maintenanceMode === 'true' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Store is currently offline</p>
                <p className="text-xs text-red-600 mt-0.5">All visitors are being redirected to the maintenance page.</p>
              </div>
            </div>
          )}

          <Field label="Maintenance Message" hint="Shown to visitors on the maintenance page">
            <textarea
              className={inputCls + ' resize-none'}
              rows={3}
              value={s.maintenanceMessage}
              onChange={up('maintenanceMessage')}
              placeholder="We are currently undergoing scheduled maintenance. Please check back soon."
            />
          </Field>

          <a
            href="/maintenance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#C9A84C] font-semibold hover:underline"
          >
            Preview maintenance page <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
          {s.maintenanceMode === 'true' && (
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block" />
              Store is offline
            </p>
          )}
          <div className="ml-auto">
            <SaveButton loading={saving === 'maintenance'} />
          </div>
        </div>
      </form>

      {/* ── Payment Keys (read-only) ──────────────────────────────────────── */}
      <div id="payments" className="bg-white border border-gray-100 p-6">
        <SectionHeader
          id="payments-header"
          icon={CreditCard}
          title="Payment Keys"
          description="API keys for Paystack and Flutterwave are managed via environment variables for security."
        />

        <div className="space-y-4">
          {[
            { label: 'PAYSTACK_SECRET_KEY', desc: 'Used to initialise and verify Paystack payments' },
            { label: 'PAYSTACK_PUBLIC_KEY', desc: 'Embedded in the client for Paystack pop-up' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-4 p-4 bg-[#faf9f6] border border-gray-100">
              <div className="flex-1">
                <p className="text-sm font-mono font-bold text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 font-mono flex-shrink-0">
                ••••••••••••
              </span>
            </div>
          ))}

          <div className="flex items-start gap-3 bg-[#faf9f6] border border-gray-100 px-4 py-4 mt-2">
            <Shield className="h-4 w-4 text-[#C9A84C] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Why aren't these editable here?</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Payment API keys are stored in your <code className="bg-gray-100 px-1 rounded text-xs">.env</code> file and
                deployed as environment variables. Storing them in the database would be a security risk.
                Update them in your hosting provider's environment settings (e.g. Vercel → Project Settings → Environment Variables).
              </p>
              <a
                href="https://vercel.com/docs/concepts/projects/environment-variables"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#C9A84C] font-semibold mt-2 hover:underline"
              >
                Vercel environment variables guide <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}