// lib/payments/flutterwave.ts

import crypto from 'crypto'

export async function initializeFlutterwavePayment({
  email,
  amount,
  reference,
  metadata,
}: any) {
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: reference,
      amount,
      currency: 'NGN',
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify/flutterwave`,
      customer: {
        email,
      },
      meta: metadata,
      customizations: {
        title: 'Durable Homes',
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/images/DurableHomesLogo.png`,
      },
    }),
  })

  return response.json()
}

export async function verifyFlutterwaveWebhook(
  payload: string,
  signature: string
) {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH

  if (!secretHash) {
    throw new Error('FLUTTERWAVE_SECRET_HASH is missing')
  }

  return signature === process.env.FLUTTERWAVE_SECRET_HASH
}