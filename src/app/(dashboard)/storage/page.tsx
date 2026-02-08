import { getStorageLocations } from "@/lib/queries/storage"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function StoragePage() {
  const locations = await getStorageLocations()

  const grouped = locations.reduce(
    (acc, loc) => {
      if (!acc[loc.zone]) acc[loc.zone] = []
      acc[loc.zone].push(loc)
      return acc
    },
    {} as Record<string, typeof locations>
  )

  return (
    <>
      <PageHeader title="Storage" description="Device storage locations" />
      {Object.entries(grouped).map(([zone, locs]) => (
        <Card key={zone} className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Zone: {zone}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {locs.map((loc) => (
                <div
                  key={loc.id}
                  className={`rounded-lg border p-3 text-sm ${
                    loc.isOccupied ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"
                  }`}
                >
                  <p className="font-medium">{loc.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Shelf {loc.shelf}{loc.bin ? `, Bin ${loc.bin}` : ""}
                  </p>
                  {loc.tickets.length > 0 && (
                    <div className="mt-1">
                      {loc.tickets.map((t) => (
                        <Link key={t.id} href={"/tickets/" + t.id} className="text-xs text-primary hover:underline block">
                          {t.ticketNumber}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {locations.length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No storage locations configured.</CardContent></Card>
      )}
    </>
  )
}
