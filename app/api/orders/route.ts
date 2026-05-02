import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orderSchema } from "@/lib/validations/order";
import { auth } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const json = await request.json();
    const body = orderSchema.parse(json);
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const item of body.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, sku: true, quantity: true },
        });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.quantity < item.quantity)
          throw new Error(`Insufficient stock for ${product.name}`);
      }

      const shippingAddr = body.shippingAddress;
      const shippingAddress = await tx.address.create({
        data: {
          userId: session?.user?.id ?? "guest",
          type: "shipping",
          firstName: shippingAddr.firstName,
          lastName: shippingAddr.lastName,
          addressLine1: shippingAddr.address,
          addressLine2: null,
          city: shippingAddr.city,
          state: shippingAddr.state,
          postalCode: shippingAddr.postalCode ?? "",
          country: shippingAddr.country ?? "NG",
          phone: shippingAddr.phone ?? null,
        },
      });

      const billingAddr = body.billingAddress ?? body.shippingAddress;
      const billingAddress = await tx.address.create({
        data: {
          userId: session?.user?.id ?? "guest",
          type: "billing",
          firstName: billingAddr.firstName,
          lastName: billingAddr.lastName,
          addressLine1: billingAddr.address,
          addressLine2: null,
          city: billingAddr.city,
          state: billingAddr.state,
          postalCode: billingAddr.postalCode ?? "",
          country: billingAddr.country ?? "NG",
          phone: billingAddr.phone ?? null,
        },
      });

      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      const productIds = body.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      return await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          guestEmail: !session ? shippingAddr.email : null,
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
  } catch (error) {
    console.error("Order creation error:", error);
    if (error instanceof Error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;
    const where: any = {};

    if (session.user.role !== "ADMIN") {
      where.userId = session.user.id;
    }
    if (status) where.status = status;

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
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}