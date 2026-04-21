import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
})

export async function PUT(request: Request) {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const json = await request.json()
    const body = profileSchema.parse(json)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: body,
    })

    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}