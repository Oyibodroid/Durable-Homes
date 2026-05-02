import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyPaystackPayment as verifyPaystackWebhook } from '@/lib/payments/paystack';
import { verifyFlutterwaveWebhook } from '@/lib/payments/flutterwave';
import { prisma as db } from '@/lib/db'; // Fixed naming mismatch
import { env } from '@/lib/env';
import { Redis } from '@upstash/redis';

const redis = env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers(); // Headers is async in newer Next.js versions
    const paystackSignature = headersList.get('x-paystack-signature');
    const flutterwaveSignature = headersList.get('verif-hash');
    
    // Determine provider based on which signature exists
    const provider = paystackSignature ? 'paystack' : 
                     flutterwaveSignature ? 'flutterwave' : 'unknown';

    const body = await request.text();

    // Idempotency check to prevent double-processing
    const idempotencyKey = paystackSignature || flutterwaveSignature;

    if (idempotencyKey && redis) {
      const processed = await redis.get(`webhook:${idempotencyKey}`);
      if (processed) return NextResponse.json({ received: true });
      await redis.setex(`webhook:${idempotencyKey}`, 86400, 'processed');
    }

    let result;
    switch (provider) {
      case 'paystack':
        result = await verifyPaystackWebhook(body, paystackSignature!);
        break;
        
      case 'flutterwave':
        // Flutterwave usually requires the secret hash from your env for comparison
        result = await verifyFlutterwaveWebhook(body, flutterwaveSignature!);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown or missing payment provider signature' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}

// NOTE: 'export const config' is removed. Next.js App Router 
// handles raw bodies via request.text() automatically.