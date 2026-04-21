import axios from 'axios'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_API = 'https://api.paystack.co'

export interface PaystackInitializeParams {
  email: string
  amount: number
  reference?: string
  metadata?: Record<string, any>
  callback_url?: string
}

export interface PaystackResponse {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export async function initializePaystackPayment({
  email,
  amount,
  reference,
  metadata,
  callback_url,
}: PaystackInitializeParams): Promise<PaystackResponse> {
  try {
    const response = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Paystack uses kobo
        reference,
        metadata,
        callback_url: callback_url || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Paystack initialization error:', error)
    throw new Error('Failed to initialize payment')
  }
}

export async function verifyPaystackPayment(reference: string) {
  try {
    const response = await axios.get(
      `${PAYSTACK_API}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Paystack verification error:', error)
    throw new Error('Failed to verify payment')
  }
}

export function generatePaystackReference() {
  return `PS-${Date.now()}-${Math.random().toString(36).substring(7)}`
}