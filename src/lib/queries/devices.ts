import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getDevices(search?: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.device.findMany({
    where: {
      orgId: session.user.orgId,
      ...(search && {
        OR: [
          { serialNumber: { contains: search, mode: "insensitive" as const } },
          { imei: { contains: search, mode: "insensitive" as const } },
          { brand: { contains: search, mode: "insensitive" as const } },
          { model: { contains: search, mode: "insensitive" as const } },
          { customer: { lastName: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    },
    include: {
      customer: true,
      _count: { select: { tickets: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDeviceById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.device.findUnique({
    where: { id, orgId: session.user.orgId },
    include: {
      customer: true,
      tickets: {
        include: {
          assignments: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}
