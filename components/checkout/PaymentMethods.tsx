'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

// Only providers that have backend implementations
type PaymentMethod = 'paystack' | 'flutterwave'

interface PaymentMethodsProps {
  onPayment: (method: PaymentMethod) => void
  isProcessing?: boolean
  amount: number
}

const methods: { id: PaymentMethod; name: string; description: string; logo: string }[] = [
  {
    id: 'paystack',
    name: 'Paystack',
    description: 'Pay securely with card, bank transfer, or USSD via Paystack',
    logo: 'PS',
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Pay with card, mobile money, or bank transfer via Flutterwave',
    logo: 'FW',
  },
]

export function PaymentMethods({ onPayment, isProcessing, amount }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('paystack')

  return (
    <div className="space-y-6">
      {/* Method selector */}
      <div className="space-y-3">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelectedMethod(method.id)}
            className={cn(
              'w-full p-4 rounded-lg border-2 text-left transition-colors',
              selectedMethod === method.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-4">
              {/* Logo placeholder */}
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-500 text-xs font-bold">{method.logo}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{method.name}</p>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
              {/* Selected indicator */}
              <div className={cn(
                'ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                selectedMethod === method.id
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              )}>
                {selectedMethod === method.id && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Amount summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">Amount to pay</span>
        <span className="text-lg font-bold text-gray-900">
          ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Pay button */}
      <Button
        type="button"
        onClick={() => onPayment(selectedMethod)}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 text-lg"
        size="lg"
        loading={isProcessing}
        disabled={isProcessing}
      >
        {isProcessing
          ? 'Redirecting to payment...'
          : `Pay with ${methods.find((m) => m.id === selectedMethod)?.name}`}
      </Button>

      {/* Trust badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Shield className="h-3.5 w-3.5" />
        <span>Your payment is secure and encrypted</span>
      </div>
    </div>
  )
}