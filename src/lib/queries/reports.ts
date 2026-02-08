import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { subDays, startOfDay, endOfDay } from "date-fns"

export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const orgId = session.user.orgId
  const storeId = session.user.activeStoreId
  const today = startOfDay(new Date())

  const [openTickets, awaitingPickup, completedToday, totalCustomers, weeklyRevenue] = await Promise.all([
    db.ticket.count({ where: { orgId, ...(storeId && { storeId }), status: { notIn: ["COMPLETE", "CANCELLED"] } } }),
    db.ticket.count({ where: { orgId, ...(storeId && { storeId }), status: "READY_FOR_PICKUP" } }),
    db.ticket.count({ where: { orgId, ...(storeId && { storeId }), completedAt: { gte: today } } }),
    db.customer.count({ where: { orgId } }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        paidAt: { gte: subDays(today, 7) },
        invoice: { orgId, ...(storeId && { storeId }) },
      },
    }),
  ])

  return { openTickets, awaitingPickup, completedToday, totalCustomers, weeklyRevenue: Number(weeklyRevenue._sum.amount ?? 0) }
}

export async function getRevenueData(days = 30) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const orgId = session.user.orgId
  const storeId = session.user.activeStoreId
  const startDate = subDays(new Date(), days)

  const payments = await db.payment.findMany({
    where: {
      paidAt: { gte: startDate },
      invoice: { orgId, ...(storeId && { storeId }) },
    },
    orderBy: { paidAt: "asc" },
  })

  const sales = await db.saleTransaction.findMany({
    where: {
      createdAt: { gte: startDate },
      ...(storeId && { storeId }),
    },
    orderBy: { createdAt: "asc" },
  })

  return { payments, sales }
}

export async function getProductivityData() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const orgId = session.user.orgId
  const thirtyDaysAgo = subDays(new Date(), 30)

  const technicians = await db.user.findMany({
    where: { orgId, role: { in: ["TECHNICIAN", "ADMIN", "MANAGER"] } },
    include: {
      assignedTickets: {
        include: {
          ticket: true,
        },
      },
    },
  })

  return technicians.map((tech) => {
    const tickets = tech.assignedTickets.map((a) => a.ticket)
    const completed = tickets.filter((t) => t.status === "COMPLETE" && t.completedAt && t.completedAt >= thirtyDaysAgo)
    const active = tickets.filter((t) => t.status !== "COMPLETE" && t.status !== "CANCELLED")

    return {
      id: tech.id,
      name: tech.name,
      completedCount: completed.length,
      activeCount: active.length,
    }
  })
}
