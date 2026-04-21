import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Fetch active promo codes from database
    const promos = await prisma.promoCode.findMany({
      where: {
        isActive: true,
        OR: [
          { validUntil: null },
          { validUntil: { gt: new Date() } }
        ]
      },
      take: 5
    })

    return NextResponse.json(promos)
  } catch (error) {
    console.error('Failed to fetch promo codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promos' },
      { status: 500 }
    )
  }
}