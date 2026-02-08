import { getSuppliers } from "@/lib/queries/suppliers"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default async function SuppliersPage() {
  const suppliers = await getSuppliers()

  return (
    <>
      <PageHeader title="Suppliers" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Contact</th>
                <th className="p-3 font-medium hidden md:table-cell">Email</th>
                <th className="p-3 font-medium hidden md:table-cell">Phone</th>
                <th className="p-3 font-medium">POs</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3">{s.contactName || "-"}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[150px]">{s.email || "-"}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{s.phone || "-"}</td>
                  <td className="p-3">{s._count.purchaseOrders}</td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No suppliers yet.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
