import { getDevices } from "@/lib/queries/devices"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const devices = await getDevices(search)

  return (
    <>
      <PageHeader title="Devices" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Brand</th>
                  <th className="p-3 font-medium">Model</th>
                  <th className="p-3 font-medium hidden md:table-cell">Serial</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <Link href={"/devices/" + device.id} className="text-primary hover:underline">
                        {device.type}
                      </Link>
                    </td>
                    <td className="p-3">{device.brand || "-"}</td>
                    <td className="p-3">{device.model || "-"}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[150px]">{device.serialNumber || "-"}</td>
                    <td className="p-3">
                      <Link href={"/customers/" + device.customerId} className="text-primary hover:underline">
                        {device.customer.firstName} {device.customer.lastName}
                      </Link>
                    </td>
                    <td className="p-3">{device._count.tickets}</td>
                  </tr>
                ))}
                {devices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No devices found.</td>
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
