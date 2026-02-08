import { getCustomerById } from "@/lib/queries/customers"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from "@/lib/constants"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>
}) {
  const { customerId } = await params
  const customer = await getCustomerById(customerId)
  if (!customer) notFound()

  return (
    <>
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={customer.email || undefined}
      />

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {customer.email && <p>{customer.email}</p>}
            {customer.phone && <p>{customer.phone}</p>}
            {customer.address && (
              <p>
                {customer.address}
                {customer.city && `, ${customer.city}`}
                {customer.postcode && ` ${customer.postcode}`}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Stats</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>Tickets: {customer.tickets.length}</p>
            <p>Devices: {customer.devices.length}</p>
            <p>Since: {format(customer.createdAt, "dd MMM yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">{customer.notes || "No notes"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets">
        <TabsList>
          <TabsTrigger value="tickets">Tickets ({customer.tickets.length})</TabsTrigger>
          <TabsTrigger value="devices">Devices ({customer.devices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium">Ticket #</th>
                      <th className="p-3 font-medium">Title</th>
                      <th className="hidden md:table-cell p-3 font-medium">Device</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="hidden sm:table-cell p-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b last:border-0">
                        <td className="p-3">
                          <Link href={`/tickets/${ticket.id}`} className="text-primary hover:underline">
                            {ticket.ticketNumber}
                          </Link>
                        </td>
                        <td className="p-3">{ticket.title}</td>
                        <td className="hidden md:table-cell p-3">
                          {ticket.device.brand} {ticket.device.model}
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary" className={TICKET_STATUS_COLORS[ticket.status]}>
                            {TICKET_STATUS_LABELS[ticket.status]}
                          </Badge>
                        </td>
                        <td className="hidden sm:table-cell p-3 text-muted-foreground">
                          {format(ticket.createdAt, "dd MMM yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Brand</th>
                      <th className="p-3 font-medium">Model</th>
                      <th className="hidden sm:table-cell p-3 font-medium">Serial</th>
                      <th className="hidden sm:table-cell p-3 font-medium">IMEI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.devices.map((device) => (
                      <tr key={device.id} className="border-b last:border-0">
                        <td className="p-3">{device.type}</td>
                        <td className="p-3">{device.brand || "-"}</td>
                        <td className="p-3">{device.model || "-"}</td>
                        <td className="hidden sm:table-cell p-3 text-muted-foreground">{device.serialNumber || "-"}</td>
                        <td className="hidden sm:table-cell p-3 text-muted-foreground">{device.imei || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
