import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { productSchema } from '@/lib/validations/product'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { z } from 'zod'


export async function GET(request: Request) {
  // Your GET function
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const published = searchParams.get('published') !== 'false'

    const skip = (page - 1) * limit

    const where: any = { publishedAt: published ? { not: null } : undefined }
    
    if (category) {
      where.categoryId = category
    }

    if (featured) {
      where.featured = true
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          images: {
            take: 1,
            where: { isMain: true }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('📦 POST /api/products - Start')
    
    const session = await auth()
    console.log('Session:', session?.user?.email)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const json = await request.json()
    console.log('📥 Received data:', JSON.stringify(json, null, 2))

    // Validate with Zod
    const result = productSchema.safeParse(json)
    
    if (!result.success) {
      console.error('❌ Validation errors:', JSON.stringify(result.error.errors, null, 2))
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: result.error.errors 
        },
        { status: 400 }
      )
    }

    const body = result.data
    console.log('✅ Validation passed:', body)

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: body.sku }
    })

    if (existingSku) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = slugify(body.name)

    // Create product with ALL fields explicitly included
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        shortDescription: body.shortDescription || null,
        price: body.price,
        compareAtPrice: body.compareAtPrice || null,
        cost: body.cost || null,
        sku: body.sku, // ← Make sure this is included
        quantity: body.quantity,
        categoryId: body.categoryId,
        status: body.status,
        featured: body.featured,
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
        ...(body.images && body.images.length > 0 && {
          images: {
            create: body.images.map((url: string, index: number) => ({
              url,
              position: index,
              isMain: index === 0,
            })),
          },
        }),
      },
      include: {
        images: true,
      },
    })

    console.log('✅ Product created:', product.id)
    return NextResponse.json(product)
  } catch (error) {
    console.error('❌ Error in POST /api/products:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}