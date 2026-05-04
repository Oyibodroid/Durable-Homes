import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

// 1. Update the Zod Schema
const productSchema = z.object({
  name: z.string().min(3),
  sku: z.string().min(3),
  description: z.string().min(10),
  shortDescription: z.string().optional().nullable(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  cost: z.number().positive().optional().nullable(),
  quantity: z.number().int().min(0),
  categoryId: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "OUT_OF_STOCK"]),
  featured: z.boolean().default(false),
  // Updated to accept objects instead of just strings
  images: z
    .array(
      z.object({
        url: z.string().url(),
        isMain: z.boolean(),
        position: z.number(),
      }),
    )
    .optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const json = await request.json();
    const body = productSchema.parse(json);

    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        description: body.description,
        shortDescription: body.shortDescription,
        price: body.price,
        compareAtPrice: body.compareAtPrice,
        cost: body.cost,
        quantity: body.quantity,
        categoryId: body.categoryId,
        status: body.status,
        featured: body.featured,
        // 2. Updated Image Logic
        ...(body.images && {
          images: {
            deleteMany: {},
            create: body.images.map((img) => ({
              url: img.url,
              position: img.position,
              isMain: img.isMain,
            })),
          },
        }),
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // This will now tell you exactly which field failed validation
      return NextResponse.json(
        {
          error: error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        },
        { status: 400 },
      );
    }

    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // Unwrap the Promise

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { position: "asc" },
        },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // Unwrap the Promise

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
