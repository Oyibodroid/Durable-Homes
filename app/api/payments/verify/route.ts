import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaystackPayment } from "@/lib/payments/paystack";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { createHmac } from "crypto";

function signOrderId(orderId: string): string {
  const secret = process.env.NEXTAUTH_SECRET!;
  return createHmac("sha256", secret).update(orderId).digest("hex");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.redirect(
      new URL("/checkout?error=missing_reference", request.url)
    );
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.redirect(
        new URL("/checkout?error=payment_not_found", request.url)
      );
    }

    // Already processed — redirect without double-processing or re-sending email
    if (payment.status === "COMPLETED") {
      const token = signOrderId(payment.orderId);
      return NextResponse.redirect(
        new URL(
          `/checkout/success?orderId=${payment.orderId}&token=${token}`,
          request.url
        )
      );
    }

    const verification = await verifyPaystackPayment(reference);
    const isSuccess = verification?.data?.status === "success";

    if (!isSuccess) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { reference },
          data: {
            status: "FAILED",
            errorMessage:
              verification?.data?.gateway_response || "Payment failed",
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "FAILED" },
        }),
      ]);

      return NextResponse.redirect(
        new URL(
          `/cart?error=payment_failed&reason=${encodeURIComponent(
            verification?.data?.gateway_response || "Payment was not successful"
          )}`,
          request.url
        )
      );
    }

    const transactionId = String(verification.data.id ?? "");
    const paidAt = new Date();

    await prisma.$transaction([
      prisma.payment.update({
        where: { reference },
        data: {
          status: "COMPLETED",
          transactionId,
          paidAt,
          metadata: verification.data,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "COMPLETED",
          status: "PROCESSING",
          paymentReference: reference,
          paymentProvider: "PAYSTACK",
          paidAt,
        },
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: "PROCESSING",
          note: `Payment confirmed via Paystack. Reference: ${reference}`,
        },
      }),
    ]);

    // ✅ Send order confirmation email after successful payment
    // Fetch full order details needed for the email
    try {
      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
        include: {
          items: {
            select: {
              name: true,
              quantity: true,
              price: true,
            },
          },
          shippingAddress: {
            select: {
              firstName: true,
              lastName: true,
              addressLine1: true,
              city: true,
              state: true,
            },
          },
          user: {
            select: { email: true },
          },
        },
      })

      if (order) {
        // Determine recipient email — logged in user or guest
        const toEmail = order.user?.email ?? order.guestEmail

        if (toEmail) {
          // Fire and forget — don't await so it doesn't delay the redirect
          sendOrderConfirmationEmail({
            to: toEmail,
            orderNumber: order.orderNumber,
            orderId: order.id,
            items: order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: Number(item.price),
            })),
            total: Number(order.total),
            shippingAddress: order.shippingAddress
              ? {
                  firstName: order.shippingAddress.firstName,
                  lastName: order.shippingAddress.lastName,
                  addressLine1: order.shippingAddress.addressLine1,
                  city: order.shippingAddress.city,
                  state: order.shippingAddress.state,
                }
              : {
                  firstName: 'Customer',
                  lastName: '',
                  addressLine1: '',
                  city: '',
                  state: '',
                },
          }).catch((err) => {
            // Log but never crash the redirect
            console.error('Order confirmation email failed:', err)
          })
        }
      }
    } catch (emailError) {
      // Email failure must never block the payment success flow
      console.error('Failed to send order confirmation email:', emailError)
    }

    const token = signOrderId(payment.orderId);
    return NextResponse.redirect(
      new URL(
        `/checkout/success?orderId=${payment.orderId}&token=${token}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(
      new URL("/checkout?error=verification_failed", request.url)
    );
  }
}