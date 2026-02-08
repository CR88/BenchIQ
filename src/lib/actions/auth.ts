"use server"

import { signIn } from "@/lib/auth"
import { db } from "@/lib/db"
import { registerSchema, loginSchema } from "@/lib/validators/auth"
import bcrypt from "bcryptjs"
import { slugify } from "@/lib/utils"
import { AuthError } from "next-auth"

export async function register(input: unknown) {
  const validated = registerSchema.parse(input)

  const existing = await db.user.findUnique({ where: { email: validated.email } })
  if (existing) throw new Error("Email already registered")

  const hashedPassword = await bcrypt.hash(validated.password, 12)
  const orgSlug = slugify(validated.orgName)
  const storeSlug = slugify(validated.storeName)

  await db.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: validated.orgName, slug: orgSlug },
    })

    const store = await tx.store.create({
      data: { orgId: org.id, name: validated.storeName, slug: storeSlug },
    })

    const user = await tx.user.create({
      data: {
        orgId: org.id,
        email: validated.email,
        name: validated.name,
        hashedPassword,
        role: "ADMIN",
      },
    })

    await tx.userStore.create({
      data: { userId: user.id, storeId: store.id },
    })
  })

  await signIn("credentials", {
    email: validated.email,
    password: validated.password,
    redirectTo: "/dashboard",
  })
}

export async function login(input: unknown) {
  const validated = loginSchema.parse(input)

  try {
    await signIn("credentials", {
      email: validated.email,
      password: validated.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error("Invalid email or password")
    }
    // NEXT_REDIRECT throws an error that must propagate
    throw error
  }
}
