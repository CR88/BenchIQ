import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import { ClipboardList, UserCheck, CheckCircle, Users } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { format } from "date-fns"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const orgId = session.user.orgId
  const storeId = session.user.activeStoreId

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [openTickets, awaitingPickup, completedToday, totalCustomers, recentTickets] =
    await Promise.all([
      db.ticket.count({
        where: {
          orgId,
          ...(storeId && { storeId }),
          status: { notIn: ["COMPLETE", "CANCELLED"] },
        },
      }),
      db.ticket.count({
        where: {
          orgId,
          ...(storeId && { storeId }),
          status: "READY_FOR_PICKUP",
        },
      }),
      db.ticket.count({
        where: {
          orgId,
          ...(storeId && { storeId }),
          completedAt: { gte: today },
        },
      }),
      db.customer.count({ where: { orgId } }),
      db.ticket.findMany({
        where: { orgId, ...(storeId && { storeId }) },
        include: { customer: true, device: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ])

  const kpis = [
    { label: "Open Tickets", value: openTickets, icon: ClipboardList },
    { label: "Awaiting Pickup", value: awaitingPickup, icon: UserCheck },
    { label: "Completed Today", value: completedToday, icon: CheckCircle },
    { label: "Total Customers", value: totalCustomers, icon: Users },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        action={
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/tickets/new">New Ticket</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/customers/new">New Customer</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Ticket #</th>
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Device</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-0">
                    <td className="py-2">
                      <Link href={`/tickets/${ticket.id}`} className="text-primary hover:underline">
                        {ticket.ticketNumber}
                      </Link>
                    </td>
                    <td className="py-2">{ticket.title}</td>
                    <td className="py-2">
                      {ticket.customer.firstName} {ticket.customer.lastName}
                    </td>
                    <td className="py-2">
                      {ticket.device.brand} {ticket.device.model}
                    </td>
                    <td className="py-2">
                      <Badge variant="secondary" className={TICKET_STATUS_COLORS[ticket.status]}>
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </Badge>
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {format(ticket.createdAt, "dd MMM yyyy")}
                    </td>
                  </tr>
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No tickets yet. Create your first ticket to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
