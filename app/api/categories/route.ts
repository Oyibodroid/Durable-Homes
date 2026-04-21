import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: {
          include: {
            children: true
          }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    // Build tree structure
    const categoryMap = new Map()
    const roots: any[] = []
    
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] })
    })
    
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId)
        if (parent) {
          parent.children.push(category)
        }
      } else {
        roots.push(category)
      }
    })
    
    return NextResponse.json(roots)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const json = await request.json()
    const { name, description, parentId } = json

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if category with same slug exists
    const existing = await prisma.category.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Category with similar name already exists' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        parentId: parentId || null,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}