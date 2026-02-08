import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getProducts(search?: string, category?: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.product.findMany({
    where: {
      orgId: session.user.orgId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
          { barcode: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(category && { category }),
    },
    include: {
      stockItems: {
        where: session.user.activeStoreId
          ? { storeId: session.user.activeStoreId }
          : undefined,
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getProductById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.product.findUnique({
    where: { id, orgId: session.user.orgId },
    include: {
      stockItems: { include: { store: true } },
    },
  })
}

export async function getLowStockAlerts() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const products = await db.product.findMany({
    where: {
      orgId: session.user.orgId,
      reorderPoint: { not: null },
    },
    include: {
      stockItems: {
        where: session.user.activeStoreId
          ? { storeId: session.user.activeStoreId }
          : undefined,
      },
    },
  })

  return products.filter((p) => {
    const totalStock = p.stockItems.reduce((sum, s) => sum + s.quantity, 0)
    return p.reorderPoint !== null && totalStock <= p.reorderPoint
  })
}
