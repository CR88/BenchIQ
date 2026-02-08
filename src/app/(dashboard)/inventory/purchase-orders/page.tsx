import { getPurchaseOrders } from "@/lib/queries/purchase-orders"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

export default async function PurchaseOrdersPage() {
  const orders = await getPurchaseOrders()

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    ORDERED: "bg-blue-100 text-blue-800",
    PARTIAL_RECEIVED: "bg-yellow-100 text-yellow-800",
    RECEIVED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  }

  return (
    <>
      <PageHeader title="Purchase Orders" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3 font-medium">PO #</th>
                <th className="p-3 font-medium">Supplier</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium text-right hidden md:table-cell">Total</th>
                <th className="p-3 font-medium hidden md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3 font-medium">{po.orderNumber}</td>
                  <td className="p-3">{po.supplier.name}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className={statusColors[po.status]}>{po.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="p-3">{po._count.items}</td>
                  <td className="p-3 text-right hidden md:table-cell">{po.totalCost ? formatCurrency(Number(po.totalCost)) : "-"}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">{format(po.createdAt, "dd MMM yyyy")}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No purchase orders.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
