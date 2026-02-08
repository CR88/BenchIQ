import { PageHeader } from "@/components/shared/page-header"
import { PosTerminal } from "@/components/pos/pos-terminal"
import { getProducts } from "@/lib/queries/inventory"

export default async function PosPage() {
  const products = await getProducts()

  return (
    <>
      <PageHeader title="Point of Sale" />
      <PosTerminal products={products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        retailPrice: Number(p.retailPrice),
        stock: p.stockItems.reduce((s, i) => s + i.quantity, 0),
      }))} />
    </>
  )
}
