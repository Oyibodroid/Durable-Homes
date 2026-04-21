import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getSettings } from '@/lib/settings'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const settings = await getSettings()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Configure your store preferences and notifications.</p>
      <SettingsForm initialSettings={settings} />
    </div>
  )
}