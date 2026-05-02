import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmailVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, name: true, emailVerified: true },
    })

    // Always return success — prevents email enumeration
    if (!user) return NextResponse.json({ success: true })

    // Already verified — nothing to do
    if (user.emailVerified) return NextResponse.json({ success: true })

    // Delete any existing tokens for this email
    await prisma.emailVerificationToken.deleteMany({
      where: { email: user.email },
    })

    // Create a fresh token — expires in 24 hours
    const token = crypto.randomBytes(32).toString('hex')
    await prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    // ✅ Log inside the function so it actually runs
    const result = await sendEmailVerificationEmail({
      to: user.email,
      token,
      name: user.name ?? undefined,
    })
    console.log('Sending to:', user.email)
    console.log('Resend result:', JSON.stringify(result))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}