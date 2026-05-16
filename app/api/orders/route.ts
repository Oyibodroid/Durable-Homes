export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderSchema } from "@/lib/validations/order";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// POST: Create a New Order (Supports both Logged-In Users and Guests)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await auth();
    const json = await request.json();

    // Log incoming client payload to easily debug structural issues in Vercel
    console.log("Incoming Checkout Payload:", JSON.stringify(json, null, 2));

    // Validate incoming data matching your Zod structural requirements
    const body = orderSchema.parse(json);
    const orderNumber = generateOrderNumber();

    // If logged in, get string ID. If guest, explicitly pass undefined so Prisma omits it.
    const targetUserId = session?.user?.id ?? undefined;

    const order = await prisma.$transaction(async (tx) => {
      // 1. Inventory Stock Audit
      for (const item of body.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, sku: true, quantity: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock available for ${product.name}`);
        }
      }

      // 2. Generate Shipping Address Record
      const shippingAddr = body.shippingAddress;
      const shippingAddress = await tx.address.create({
        data: {
          // Only link the relation if the user is authenticated
          ...(targetUserId ? { user: { connect: { id: targetUserId } } } : {}),
          type: "shipping",
          firstName: shippingAddr.firstName,
          lastName: shippingAddr.lastName,
          addressLine1: shippingAddr.address || (shippingAddr as any).addressLine1,
          addressLine2: undefined,
          city: shippingAddr.city,
          state: shippingAddr.state,
          postalCode: shippingAddr.postalCode ?? "",
          country: shippingAddr.country ?? "NG",
          phone: shippingAddr.phone ?? undefined,
        },
      });

      // 3. Generate Billing Address Record (Fallback to shipping if omitted)
      const billingAddr = body.billingAddress ?? body.shippingAddress;
      const billingAddress = await tx.address.create({
        data: {
          ...(targetUserId ? { user: { connect: { id: targetUserId } } } : {}),
          type: "billing",
          firstName: billingAddr.firstName,
          lastName: billingAddr.lastName,
          addressLine1: billingAddr.address || (billingAddr as any).addressLine1,
          addressLine2: undefined,
          city: billingAddr.city,
          state: billingAddr.state,
          postalCode: billingAddr.postalCode ?? "",
          country: billingAddr.country ?? "NG",
          phone: billingAddr.phone ?? undefined,
        },
      });

      // 4. Update and Decrement Stock Allocations
      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Fetch specific product metadata to safely attach naming strings to order historical records
      const productIds = body.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      // 5. Save Core Order Object Tree
      return await tx.order.create({
        data: {
          orderNumber,
          userId: targetUserId, // Will map elegantly to NULL in DB if undefined
          guestEmail: !session ? (shippingAddr.email ?? undefined) : undefined,
          status: "PENDING",
          paymentStatus: "PENDING",
          subtotal: body.subtotal,
          taxTotal: body.tax,
          shippingTotal: body.shipping,
          total: body.total,
          discountTotal: 0,
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress.id,
          items: {
            create: body.items.map((item) => {
              const product = productMap.get(item.productId);
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                name: product?.name ?? "Unknown Product",
                sku: product?.sku ?? item.productId,
              };
            }),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("CRITICAL ORDER FAULT DETAIL:", error);

    // Explicit return structure for structural schema compilation errors
    if (error?.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failure", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to finalize order creation" },
      { status: 400 },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET: Fetch Paginated Order History (Requires Authentication)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access denied" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Standard profiles can only view their own orders; Admin profiles view global pools
    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { items: { include: { product: true } }, user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Orders Query API Failure Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order context ledger logs" },
      { status: 500 },
    );
  }
}