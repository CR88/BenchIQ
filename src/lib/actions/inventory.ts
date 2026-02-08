"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { productSchema } from "@/lib/validators/inventory"
import { checkPermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function createProduct(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:create")

  const data = productSchema.parse(input)
  const product = await db.product.create({
    data: { ...data, orgId: session.user.orgId },
  })

  revalidatePath("/inventory")
  return product
}

export async function updateProduct(productId: string, input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:update")

  const data = productSchema.parse(input)
  const product = await db.product.update({
    where: { id: productId, orgId: session.user.orgId },
    data,
  })

  revalidatePath("/inventory")
  revalidatePath("/inventory/" + productId)
  return product
}

export async function deleteProduct(productId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:delete")

  await db.product.delete({ where: { id: productId, orgId: session.user.orgId } })
  revalidatePath("/inventory")
}

export async function adjustStock(productId: string, storeId: string, quantityDelta: number) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:update")

  await db.stockItem.upsert({
    where: { productId_storeId: { productId, storeId } },
    update: { quantity: { increment: quantityDelta } },
    create: { productId, storeId, quantity: Math.max(0, quantityDelta) },
  })

  revalidatePath("/inventory")
  revalidatePath("/inventory/" + productId)
}
