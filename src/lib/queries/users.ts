import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getUsers() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.user.findMany({
    where: { orgId: session.user.orgId },
    include: { stores: { include: { store: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTechnicians() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.user.findMany({
    where: {
      orgId: session.user.orgId,
      role: { in: ["TECHNICIAN", "ADMIN", "MANAGER"] },
      isActive: true,
    },
    orderBy: { name: "asc" },
  })
}
