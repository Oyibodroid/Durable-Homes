import { NextAuthConfig, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// 1. JWT import is required for the augmentation below
import { JWT } from "next-auth/jwt"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(parsed.data.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Prisma role
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role ?? "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
}

// ── TYPE AUGMENTATION ────────────────────────────────────────────────────────
// This MUST be exactly the same across your project to avoid "identical modifiers" errors.

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    role: string // No '?' to keep modifiers identical
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string // No '?' to keep modifiers identical
  }
}


declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    role: string 
  }
}

// ✅ ADD THIS BLOCK to fix the Adapter error
declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}