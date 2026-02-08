"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { supplierSchema } from "@/lib/validators/suppliers"
import { checkPermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function createSupplier(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:create")

  const data = supplierSchema.parse(input)
  const supplier = await db.supplier.create({
    data: { ...data, email: data.email || null, orgId: session.user.orgId },
  })

  revalidatePath("/inventory/suppliers")
  return supplier
}

export async function updateSupplier(supplierId: string, input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:update")

  const data = supplierSchema.parse(input)
  const supplier = await db.supplier.update({
    where: { id: supplierId, orgId: session.user.orgId },
    data: { ...data, email: data.email || null },
  })

  revalidatePath("/inventory/suppliers")
  return supplier
}

export async function deleteSupplier(supplierId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:delete")

  await db.supplier.delete({ where: { id: supplierId, orgId: session.user.orgId } })
  revalidatePath("/inventory/suppliers")
}
