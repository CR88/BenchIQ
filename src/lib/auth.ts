import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { loginSchema } from "@/lib/validators/auth"
import { authConfig } from "@/lib/auth.config"
import type { Role } from "@/generated/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) return null

        const { email, password } = validated.data
        const user = await db.user.findUnique({
          where: { email },
          include: { stores: { include: { store: true } } },
        })

        if (!user || !user.hashedPassword) return null
        const passwordMatch = await bcrypt.compare(password, user.hashedPassword)
        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
          image: user.image,
          activeStoreId: user.stores[0]?.storeId ?? null,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as Role
        token.orgId = user.orgId as string
        token.activeStoreId = user.activeStoreId as string | null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
        session.user.orgId = token.orgId as string
        session.user.activeStoreId = token.activeStoreId as string | null
      }
      return session
    },
  },
})
