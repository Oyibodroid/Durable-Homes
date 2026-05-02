import { prisma } from '@/lib/db'

export interface StoreSettings {
  // Store Info
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeCity: string
  storeState: string
  storeCountry: string

  // Shipping
  shippingFreeThreshold: string   // order amount for free shipping
  shippingBaseRate: string        // default shipping cost
  shippingExpressRate: string     // express shipping cost

  // Tax
  taxRate: string                 // percentage e.g. "7.5"
  taxEnabled: string              // "true" | "false"

  // Notifications
  adminNotificationEmail: string  // email to receive order alerts
  lowStockThreshold: string       // units before low stock alert
  lowStockAlerts: string          // "true" | "false"

  // Store status
  maintenanceMode: string         // "true" | "false"
  maintenanceMessage: string
}

const DEFAULTS: StoreSettings = {
  storeName: 'Durable Homes',
  storeEmail: 'sales@durablehomes.com',
  storePhone: '+234 123 456 7890',
  storeAddress: '123 Construction Avenue',
  storeCity: 'Ikeja',
  storeState: 'Lagos',
  storeCountry: 'NG',
  shippingFreeThreshold: '100000',
  shippingBaseRate: '5000',
  shippingExpressRate: '15000',
  taxRate: '7.5',
  taxEnabled: 'true',
  adminNotificationEmail: '',
  lowStockThreshold: '10',
  lowStockAlerts: 'true',
  maintenanceMode: 'false',
  maintenanceMessage: 'We are currently undergoing maintenance. Please check back soon.',
}

/**
 * Fetch all settings from DB, falling back to defaults for missing keys.
 */
export async function getSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany()
  const map = new Map(rows.map((r) => [r.key, r.value]))

  const result = {} as StoreSettings
  for (const key of Object.keys(DEFAULTS) as (keyof StoreSettings)[]) {
    result[key] = map.get(key) ?? DEFAULTS[key]
  }
  return result
}

/**
 * Upsert multiple settings at once.
 */
export async function saveSettings(data: Partial<StoreSettings>) {
  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  )
}

/**
 * Get a single setting value with a fallback.
 */
export async function getSetting(key: keyof StoreSettings): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } })
  return row?.value ?? DEFAULTS[key]
}