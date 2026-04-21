import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createHmac } from "crypto";

const statusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  note: z.string().optional(),
});

function verifyOrderToken(orderId: string, token: string): boolean {
  try {
    const secret = process.env.NEXTAUTH_SECRET!;
    const expected = createHmac("sha256", secret).update(orderId).digest("hex");
    return expected === token;
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // ✅ Check for signed token in URL query string
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const hasValidToken = token ? verifyOrderToken(id, token) : false;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, where: { isMain: true } },
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payments: { orderBy: { createdAt: "desc" } },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isAdmin = session?.user?.role === "ADMIN";
    const isOwner = session?.user?.id && order.userId === session.user.id;

    if (!isAdmin && !isOwner && !hasValidToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const json = await request.json();
    const { status, note } = statusSchema.parse(json);

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            note: note || `Status updated to ${status}`,
            changedBy: session.user.email,
          },
        },
      },
      include: { statusHistory: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}