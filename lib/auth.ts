import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
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
          if (!user.emailVerified) return null
          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const existingUser = await prisma.user.findUnique({ where: { email: user.email! } })
          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: { email: user.email!, name: user.name, image: user.image, emailVerified: new Date() },
            })
            user.id = newUser.id
          } else {
            user.id = existingUser.id
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { image: user.image ?? existingUser.image, name: user.name ?? existingUser.name, emailVerified: existingUser.emailVerified ?? new Date() },
            })
          }
        } catch (error) {
          console.error("Social login DB error:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) { token.id = user.id; token.role = (user as any).role ?? "USER" }
      if (account?.provider !== "credentials" && token.id && !token.role) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { role: true } })
          token.role = dbUser?.role ?? "USER"
        } catch {}
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) { session.user.id = token.id as string; session.user.role = token.role as string }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)