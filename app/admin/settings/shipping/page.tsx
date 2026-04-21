import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Truck, Save, Plus, Trash2 } from 'lucide-react'

export default async function ShippingSettingsPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  // Mock shipping zones - replace with database
  const shippingZones = [
    {
      id: '1',
      name: 'Lagos Mainland',
      rate: 2500,
      estimatedDays: '2-3 business days',
    },
    {
      id: '2',
      name: 'Lagos Island',
      rate: 3000,
      estimatedDays: '1-2 business days',
    },
    {
      id: '3',
      name: 'South West (Ogun, Oyo, Osun)',
      rate: 3500,
      estimatedDays: '3-5 business days',
    },
    {
      id: '4',
      name: 'Other States',
      rate: 5000,
      estimatedDays: '5-7 business days',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shipping Settings</h1>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5 text-gray-400" />
            General Shipping Settings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Origin Country</label>
              <select className="w-full border rounded-lg px-3 py-2" defaultValue="NG">
                <option value="NG">Nigeria</option>
                <option value="GH">Ghana</option>
                <option value="KE">Kenya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight Unit</label>
              <select className="w-full border rounded-lg px-3 py-2" defaultValue="kg">
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping Zones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Shipping Zones</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </div>

          <div className="space-y-4">
            {shippingZones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Zone Name</label>
                    <Input defaultValue={zone.name} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Shipping Rate (₦)</label>
                    <Input type="number" defaultValue={zone.rate} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Estimated Delivery</label>
                    <Input defaultValue={zone.estimatedDays} className="bg-white" />
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Free Shipping Rules */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Free Shipping Rules</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
              <span className="text-sm">Enable free shipping</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="text-sm">Minimum order amount:</label>
              <Input type="number" defaultValue="100000" className="w-48" />
              <span className="text-sm text-gray-500">₦</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Shipping Settings
          </Button>
        </div>
      </div>
    </div>
  )
}