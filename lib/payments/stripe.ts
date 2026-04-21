// lib/payments/stripe.ts
import Stripe from 'stripe';
import { env } from '@/lib/env';
import { db } from '@/lib/db';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createStripePaymentIntent(orderId: string, amount: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw new Error('Failed to create payment intent');
  }
}

export async function verifyStripeWebhook(
  body: string,
  signature: string,
  webhookSecret: string
) {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handleFailedPayment(event.data.object);
        break;
      case 'payment_intent.refunded':
        await handleRefundedPayment(event.data.object);
        break;
    }
    
    return { received: true };
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw new Error('Webhook verification failed');
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  // Use transaction to ensure data consistency
  await db.$transaction(async (tx) => {
    // Update order status
    const order = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'PROCESSING',
        paidAt: new Date(),
        paymentReference: paymentIntent.id,
      },
    });

    // Create payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: 'STRIPE',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'COMPLETED',
        reference: paymentIntent.id,
        transactionId: paymentIntent.id,
        metadata: paymentIntent,
      },
    });

    // Update inventory
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart if user is logged in
    if (order.userId) {
      await tx.cart.deleteMany({
        where: { userId: order.userId },
      });
    }
  });
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'FAILED',
      status: 'PENDING',
    },
  });
}

async function handleRefundedPayment(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'REFUNDED',
      status: 'REFUNDED',
    },
  });
}