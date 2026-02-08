import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSuppliers } from "@/lib/queries/suppliers"
import { getProducts } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { PurchaseOrderForm } from "@/components/purchase-orders/purchase-order-form"

export default async function NewPurchaseOrderPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [suppliers, products] = await Promise.all([
    getSuppliers(),
    getProducts(),
  ])

  return (
    <>
      <PageHeader title="New Purchase Order" />
      <PurchaseOrderForm
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          costPrice: Number(p.costPrice ?? 0),
        }))}
      />
    </>
  )
}
