// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyStripeWebhook } from '@/lib/payments/stripe';
import { verifyPaystackWebhook } from '@/lib/payments/paystack';
import { verifyFlutterwaveWebhook } from '@/lib/payments/flutterwave';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { Redis } from '@upstash/redis';

// Initialize Redis for idempotency
const redis = env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const signature = headersList.get('stripe-signature') || 
                     headersList.get('x-paystack-signature') ||
                     headersList.get('verif-hash');
    
    const provider = headersList.get('x-payment-provider') || 
                    (signature?.includes('stripe') ? 'stripe' : 
                     headersList.get('x-paystack-signature') ? 'paystack' : 
                     headersList.get('verif-hash') ? 'flutterwave' : 'unknown');

    // Get raw body for signature verification
    const body = await request.text();

    // Check idempotency
    const idempotencyKey = headersList.get('idempotency-key') || 
                          headersList.get('stripe-signature')?.split(',')[0] ||
                          headersList.get('x-paystack-signature') ||
                          headersList.get('verif-hash');

    if (idempotencyKey && redis) {
      const processed = await redis.get(`webhook:${idempotencyKey}`);
      if (processed) {
        return NextResponse.json({ received: true });
      }
      
      // Set idempotency key (expire after 24 hours)
      await redis.setex(`webhook:${idempotencyKey}`, 86400, 'processed');
    }

    // Verify webhook based on provider
    let result;
    switch (provider) {
      case 'stripe':
        if (!env.STRIPE_WEBHOOK_SECRET) {
          throw new Error('Stripe webhook secret not configured');
        }
        result = await verifyStripeWebhook(body, signature!, env.STRIPE_WEBHOOK_SECRET);
        break;
        
      case 'paystack':
        result = await verifyPaystackWebhook(body, signature!);
        break;
        
      case 'flutterwave':
        result = await verifyFlutterwaveWebhook(body, headersList);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown payment provider' },
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

// Disable body parsing for raw body
export const config = {
  api: {
    bodyParser: false,
  },
};