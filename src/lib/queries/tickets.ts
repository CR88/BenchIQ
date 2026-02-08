import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { TicketStatus } from "@/generated/prisma"

export async function getTickets(filters?: {
  status?: TicketStatus
  search?: string
  storeId?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.ticket.findMany({
    where: {
      orgId: session.user.orgId,
      storeId: filters?.storeId ?? session.user.activeStoreId ?? undefined,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && {
        OR: [
          { ticketNumber: { contains: filters.search, mode: "insensitive" as const } },
          { title: { contains: filters.search, mode: "insensitive" as const } },
          { customer: { lastName: { contains: filters.search, mode: "insensitive" as const } } },
        ],
      }),
    },
    include: {
      customer: true,
      device: true,
      assignments: { include: { user: true } },
      storageLocation: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getTicketById(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.ticket.findUnique({
    where: { id, orgId: session.user.orgId },
    include: {
      customer: true,
      device: true,
      store: true,
      assignments: { include: { user: true } },
      storageLocation: true,
      notes: { include: { user: true }, orderBy: { createdAt: "desc" } },
      history: { include: { user: true }, orderBy: { createdAt: "desc" } },
      lineItems: { include: { product: true } },
      invoice: true,
    },
  })
}

export async function getTicketsByStatus() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.ticket.findMany({
    where: {
      orgId: session.user.orgId,
      storeId: session.user.activeStoreId ?? undefined,
      status: { not: "CANCELLED" },
    },
    include: {
      customer: true,
      device: true,
      assignments: { include: { user: true } },
      storageLocation: true,
    },
    orderBy: { createdAt: "asc" },
  })
}
