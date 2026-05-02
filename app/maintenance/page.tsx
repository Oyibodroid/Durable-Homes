import { getSetting } from '@/lib/settings'
import Image from "next/image";

export default async function MaintenancePage() {
  const message = await getSetting('maintenanceMessage')

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-50  rounded-full border flex items-center justify-center mx-auto mb-6">
              <Image src="/images/DurableHomesLogo.png" alt="Durable Homes Logo" width={2000} height={2000} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Under Maintenance</h1>
        <p className="text-gray-400 leading-relaxed">{message}</p>
        <p className="text-gray-600 text-sm mt-6">
          For urgent enquiries:{' '}
          <a href="mailto:sales@durablehomes.com" className="text-yellow-400 hover:underline">
            sales@durablehomes.com
          </a>
        </p>
      </div>
    </div>
  )
}