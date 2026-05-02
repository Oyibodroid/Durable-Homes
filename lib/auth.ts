import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import type { NextAuthConfig } from "next-auth"

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
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null
          const { email, password } = loginSchema.parse(credentials)
          
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) return null
          
          const isValid = await bcrypt.compare(password, user.password)
          if (!isValid) return null
          
          // Ensure they are verified before logging in
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
      // When the user logs in, attach id and role to the token
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? "USER"
      }
      return token
    },
    async session({ session, token }) {
      // Pass the id and role from the token to the browser session
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)