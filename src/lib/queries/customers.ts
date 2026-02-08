import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getCustomers(search?: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.customer.findMany({
    where: {
      orgId: session.user.orgId,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    },
    include: {
      _count: { select: { tickets: true, devices: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getCustomerById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.customer.findUnique({
    where: { id, orgId: session.user.orgId },
    include: {
      devices: true,
      tickets: {
        include: { device: true, assignments: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}
