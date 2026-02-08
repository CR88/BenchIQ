"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { customerSchema } from "@/lib/validators/customers"
import { checkPermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function createCustomer(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "customers:create")

  const data = customerSchema.parse(input)

  const customer = await db.customer.create({
    data: {
      ...data,
      email: data.email || null,
      orgId: session.user.orgId,
    },
  })

  revalidatePath("/customers")
  return customer
}

export async function updateCustomer(customerId: string, input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "customers:update")

  const data = customerSchema.parse(input)

  const customer = await db.customer.update({
    where: { id: customerId, orgId: session.user.orgId },
    data: { ...data, email: data.email || null },
  })

  revalidatePath("/customers")
  revalidatePath(`/customers/${customerId}`)
  return customer
}

export async function deleteCustomer(customerId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "customers:delete")

  await db.customer.delete({
    where: { id: customerId, orgId: session.user.orgId },
  })

  revalidatePath("/customers")
}
