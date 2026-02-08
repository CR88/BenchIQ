import { getDeviceById } from "@/lib/queries/devices"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from "@/lib/constants"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"

export default async function DeviceDetailPage({ params }: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = await params
  const device = await getDeviceById(deviceId)
  if (!device) notFound()

  return (
    <>
      <PageHeader title={`${device.brand || ""} ${device.model || device.type}`} />
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>Type: {device.type}</p>
            {device.brand && <p>Brand: {device.brand}</p>}
            {device.model && <p>Model: {device.model}</p>}
            {device.serialNumber && <p>Serial: {device.serialNumber}</p>}
            {device.imei && <p>IMEI: {device.imei}</p>}
            {device.color && <p>Colour: {device.color}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Owner</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <Link href={"/customers/" + device.customerId} className="text-primary hover:underline">
              {device.customer.firstName} {device.customer.lastName}
            </Link>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Repair History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium">Ticket #</th>
                  <th className="p-3 font-medium">Title</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="hidden sm:table-cell p-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {device.tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-0">
                    <td className="p-3">
                      <Link href={"/tickets/" + ticket.id} className="text-primary hover:underline">{ticket.ticketNumber}</Link>
                    </td>
                    <td className="p-3">{ticket.title}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className={TICKET_STATUS_COLORS[ticket.status]}>
                        {TICKET_STATUS_LABELS[ticket.status]}
                      </Badge>
                    </td>
                    <td className="hidden sm:table-cell p-3 text-muted-foreground">{format(ticket.createdAt, "dd MMM yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
