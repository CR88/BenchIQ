import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getSuppliers(search?: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.supplier.findMany({
    where: {
      orgId: session.user.orgId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { contactName: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    },
    include: { _count: { select: { purchaseOrders: true } } },
    orderBy: { name: "asc" },
  })
}

export async function getSupplierById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.supplier.findUnique({
    where: { id, orgId: session.user.orgId },
    include: {
      purchaseOrders: { orderBy: { createdAt: "desc" } },
    },
  })
}
