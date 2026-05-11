// lib/payments/flutterwave.ts

export async function initializeFlutterwavePayment({ email, amount, reference, metadata }: any) {
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: reference,
      amount: amount, // Flutterwave takes Naira directly (no need to multiply by 100)
      currency: 'NGN',
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify/flutterwave`,
      customer: {
        email: email,
      },
      meta: metadata,
      customizations: {
        title: "Durable Homes",
        logo: "/images/DurableHomesLogo.png",
      },
    }),
  });

  const data = await response.json();
  return data;
}