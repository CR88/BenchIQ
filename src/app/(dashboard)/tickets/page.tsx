import { getTickets } from "@/lib/queries/tickets"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import { TicketStatus } from "@/generated/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { TicketFilters } from "@/components/tickets/ticket-filters"

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams
  const tickets = await getTickets({
    status: status as TicketStatus | undefined,
    search,
  })

  return (
    <>
      <PageHeader
        title="Tickets"
        action={
          <Button asChild>
            <Link href="/tickets/new">New Ticket</Link>
          </Button>
        }
      />

      <TicketFilters currentStatus={status} currentSearch={search} />

      <Card className="mt-4">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium">Ticket #</th>
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium hidden md:table-cell">Device</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Priority</th>
                  <th className="p-3 font-medium hidden md:table-cell">Assigned</th>
                  <th className="p-3 font-medium hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <Link href={`/tickets/${ticket.id}`} className="text-primary hover:underline font-medium">
                        {ticket.ticketNumber}
                      </Link>
                    </td>
                    <td className="p-3 truncate max-w-[150px]">{ticket.title}</td>
                    <td className="p-3">
                      {ticket.customer.firstName} {ticket.customer.lastName}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {ticket.device.brand} {ticket.device.model}
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className={TICKET_STATUS_COLORS[ticket.status]}>
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className={PRIORITY_COLORS[ticket.priority]}>
                        {PRIORITY_LABELS[ticket.priority]}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[150px]">
                      {ticket.assignments.map((a) => a.user.name).join(", ") || "-"}
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {format(ticket.createdAt, "dd MMM yyyy")}
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No tickets found.
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
