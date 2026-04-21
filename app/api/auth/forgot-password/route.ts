import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

console.log('API key exists:', !!process.env.RESEND_API_KEY)
console.log('API key prefix:', process.env.RESEND_API_KEY?.substring(0, 5))

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('1. Received email:', email)

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    console.log('2. User found:', !!user)

    if (!user) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    console.log('3. Token generated:', token.substring(0, 10) + '...')

    await prisma.passwordResetToken.create({
      data: { email: user.email, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    })
    console.log('4. Token saved to DB')

    const result = await sendPasswordResetEmail({ to: user.email, token })
    console.log('5. Resend result:', JSON.stringify(result))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
  }
}