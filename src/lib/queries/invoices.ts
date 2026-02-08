import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { InvoiceStatus } from "@/generated/prisma"

export async function getInvoices(filters?: { status?: InvoiceStatus; search?: string }) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.invoice.findMany({
    where: {
      orgId: session.user.orgId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && {
        OR: [
          { invoiceNumber: { contains: filters.search, mode: "insensitive" as const } },
          { customer: { firstName: { contains: filters.search, mode: "insensitive" as const } } },
          { customer: { lastName: { contains: filters.search, mode: "insensitive" as const } } },
        ],
      }),
    },
    include: {
      customer: true,
      ticket: { select: { ticketNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
