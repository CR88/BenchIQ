import type { Role } from "@/generated/prisma"

declare module "next-auth" {
  interface User {
    role?: Role
    orgId?: string
    activeStoreId?: string | null
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
      role: Role
      orgId: string
      activeStoreId: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role
    orgId?: string
    activeStoreId?: string | null
  }
}
