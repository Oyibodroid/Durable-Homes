import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod" // ✅ Fixed typo here
import type { NextAuthConfig, DefaultSession } from "next-auth"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null
          const { email, password } = loginSchema.parse(credentials)
          
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) return null
          
          const isValid = await bcrypt.compare(password, user.password)
          if (!isValid) return null
          
          if (!user.emailVerified) return null

          return { 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role 
          }
        } catch (error) {
          return null
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
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// ── TYPE DEFINITIONS ──────────────────────────────────────────────────────────

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

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}