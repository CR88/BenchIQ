import { getTicketById } from "@/lib/queries/tickets"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge"
import { PriorityBadge } from "@/components/tickets/priority-badge"
import { TicketStatusChanger } from "@/components/tickets/ticket-status-changer"
import { TicketTimeline } from "@/components/tickets/ticket-timeline"
import { TicketNoteForm } from "@/components/tickets/ticket-note-form"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const ticket = await getTicketById(ticketId)
  if (!ticket) notFound()

  const lineItemsTotal = ticket.lineItems.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0
  )

  return (
    <>
      <PageHeader title={ticket.ticketNumber} description={ticket.title} />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <CardTitle className="flex-1">{ticket.title}</CardTitle>
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </CardHeader>
            <CardContent>
              {ticket.description && (
                <p className="text-sm text-muted-foreground">{ticket.description}</p>
              )}
            </CardContent>
          </Card>

          {ticket.diagnosis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{ticket.diagnosis}</p>
              </CardContent>
            </Card>
          )}

          {ticket.lineItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium">Description</th>
                        <th className="hidden sm:table-cell pb-2 font-medium text-right">Qty</th>
                        <th className="hidden sm:table-cell pb-2 font-medium text-right">Price</th>
                        <th className="pb-2 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ticket.lineItems.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2">
                            {item.description}
                            {item.isLabor && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Labour
                              </Badge>
                            )}
                          </td>
                          <td className="hidden sm:table-cell py-2 text-right">{item.quantity}</td>
                          <td className="hidden sm:table-cell py-2 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                          <td className="py-2 text-right">
                            {formatCurrency(Number(item.unitPrice) * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-medium">
                        <td colSpan={3} className="hidden sm:table-cell pt-2 text-right">
                          Subtotal
                        </td>
                        <td className="sm:hidden pt-2 text-right">Subtotal</td>
                        <td className="pt-2 text-right">{formatCurrency(lineItemsTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketTimeline notes={ticket.notes} history={ticket.history} />
              <Separator className="my-4" />
              <TicketNoteForm ticketId={ticket.id} />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <TicketStatusChanger ticketId={ticket.id} currentStatus={ticket.status} />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <Link href={`/customers/${ticket.customerId}`} className="text-primary hover:underline font-medium">
                {ticket.customer.firstName} {ticket.customer.lastName}
              </Link>
              {ticket.customer.email && <p>{ticket.customer.email}</p>}
              {ticket.customer.phone && <p>{ticket.customer.phone}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Device</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">
                {ticket.device.brand} {ticket.device.model}
              </p>
              <p>Type: {ticket.device.type}</p>
              {ticket.device.serialNumber && <p>Serial: {ticket.device.serialNumber}</p>}
              {ticket.device.imei && <p>IMEI: {ticket.device.imei}</p>}
              {ticket.device.color && <p>Colour: {ticket.device.color}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assigned</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {ticket.assignments.length > 0 ? (
                <div className="space-y-1">
                  {ticket.assignments.map((a) => (
                    <p key={a.id}>{a.user.name}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No one assigned</p>
              )}
            </CardContent>
          </Card>

          {ticket.storageLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Storage</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{ticket.storageLocation.label}</p>
                <p className="text-muted-foreground">
                  Zone: {ticket.storageLocation.zone}, Shelf: {ticket.storageLocation.shelf}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dates</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>Created: {format(ticket.createdAt, "dd MMM yyyy HH:mm")}</p>
              {ticket.estimatedCompletion && (
                <p>Est. Completion: {format(ticket.estimatedCompletion, "dd MMM yyyy")}</p>
              )}
              {ticket.completedAt && (
                <p>Completed: {format(ticket.completedAt, "dd MMM yyyy HH:mm")}</p>
              )}
              {ticket.pickedUpAt && (
                <p>Picked up: {format(ticket.pickedUpAt, "dd MMM yyyy HH:mm")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
