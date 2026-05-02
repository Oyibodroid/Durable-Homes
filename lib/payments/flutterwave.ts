import { env } from '@/lib/env';

export async function verifyFlutterwaveWebhook(body: string, signature: string) {
  // Flutterwave sends a secret hash you defined in your dashboard
  const secretHash = env.FLUTTERWAVE_SECRET_KEY;

  if (!signature || signature !== secretHash) {
    throw new Error('Invalid Flutterwave signature');
  }

  const event = JSON.parse(body);
  // Logic for 'charge.completed'
  
  return { received: true };
}