import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getPurchaseOrders() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.purchaseOrder.findMany({
    where: { orgId: session.user.orgId },
    include: { supplier: true, _count: { select: { items: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPurchaseOrderById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.purchaseOrder.findUnique({
    where: { id, orgId: session.user.orgId },
    include: {
      supplier: true,
      items: { include: { product: true } },
    },
  })
}
