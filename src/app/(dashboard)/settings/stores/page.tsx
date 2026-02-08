import { getUserStores } from "@/lib/queries/stores"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function StoresPage() {
  const stores = await getUserStores()

  return (
    <>
      <PageHeader title="Stores" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Address</th>
                <th className="p-3 font-medium hidden md:table-cell">City</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{store.name}</td>
                  <td className="p-3 text-muted-foreground">{store.address || "-"}</td>
                  <td className="p-3 hidden md:table-cell">{store.city || "-"}</td>
                  <td className="p-3">{store.isActive ? <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>}</td>
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
