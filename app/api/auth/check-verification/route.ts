import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ exists: false, verified: false })

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { emailVerified: true },
    })

    if (!user) return NextResponse.json({ exists: false, verified: false })

    return NextResponse.json({ exists: true, verified: !!user.emailVerified })
  } catch {
    return NextResponse.json({ exists: false, verified: false })
  }
}