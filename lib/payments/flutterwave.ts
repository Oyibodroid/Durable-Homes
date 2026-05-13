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

export function verifyFlutterwaveWebhook(
  payload: string,
  flwSignature: string | null
): boolean {
  // Use the SECRET_HASH provided by Flutterwave dashboard
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH

  if (!secretHash) {
    throw new Error('FLUTTERWAVE_SECRET_HASH is missing from environment variables')
  }

  // 1. If the signature is completely missing, the request is invalid.
  if (!flwSignature) {
    return false;
  }

  // 2. Generate the local hash using the raw payload body and your secret hash key.
  const localHash = crypto
    .createHmac('sha256', secretHash)
    .update(payload)
    .digest('hex');

  // 3. Securely compare the received signature with your local hash.
  // Use crypto.timingSafeEqual to prevent timing attacks.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(flwSignature, 'hex'),
      Buffer.from(localHash, 'hex')
    );
  } catch (err) {
    // If Buffer creation fails (invalid length, etc.), comparison fails.
    return false;
  }
}