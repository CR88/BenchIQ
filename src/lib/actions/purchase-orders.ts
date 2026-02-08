"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { purchaseOrderSchema } from "@/lib/validators/purchase-orders"
import { checkPermission } from "@/lib/permissions"
import { generatePONumber } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function createPurchaseOrder(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:create")

  const data = purchaseOrderSchema.parse(input)
  const totalCost = data.items.reduce((s, i) => s + i.unitCost * i.quantity, 0)

  const po = await db.purchaseOrder.create({
    data: {
      orderNumber: generatePONumber(),
      orgId: session.user.orgId,
      supplierId: data.supplierId,
      notes: data.notes,
      totalCost,
      items: { create: data.items },
    },
  })

  revalidatePath("/inventory/purchase-orders")
  return po
}

export async function submitPurchaseOrder(poId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:update")

  await db.purchaseOrder.update({
    where: { id: poId },
    data: { status: "ORDERED", orderedAt: new Date() },
  })

  revalidatePath("/inventory/purchase-orders")
}

export async function receivePurchaseOrder(poId: string, items: Array<{ poItemId: string; receivedQty: number }>) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "inventory:update")

  await db.$transaction(async (tx) => {
    for (const item of items) {
      const poItem = await tx.purchaseOrderItem.update({
        where: { id: item.poItemId },
        data: { receivedQty: { increment: item.receivedQty } },
      })

      await tx.stockItem.upsert({
        where: { productId_storeId: { productId: poItem.productId, storeId: session.user.activeStoreId! } },
        update: { quantity: { increment: item.receivedQty } },
        create: { productId: poItem.productId, storeId: session.user.activeStoreId!, quantity: item.receivedQty },
      })
    }

    const allItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: poId } })
    const allReceived = allItems.every((i) => i.receivedQty >= i.quantity)

    await tx.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: allReceived ? "RECEIVED" : "PARTIAL_RECEIVED",
        ...(allReceived && { receivedAt: new Date() }),
      },
    })
  })

  revalidatePath("/inventory/purchase-orders")
  revalidatePath("/inventory")
}
