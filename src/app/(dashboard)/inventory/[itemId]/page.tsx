import { getProductById } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { notFound } from "next/navigation"

export default async function ProductDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  const product = await getProductById(itemId)
  if (!product) notFound()

  return (
    <>
      <PageHeader title={product.name} description={product.sku || undefined} />
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            {product.sku && <p>SKU: {product.sku}</p>}
            {product.barcode && <p>Barcode: {product.barcode}</p>}
            {product.category && <p>Category: {product.category}</p>}
            <p>Retail: {formatCurrency(Number(product.retailPrice))}</p>
            {product.costPrice && <p>Cost: {formatCurrency(Number(product.costPrice))}</p>}
            {product.reorderPoint !== null && <p>Reorder Point: {product.reorderPoint}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Stock by Store</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {product.stockItems.length > 0 ? (
              <div className="space-y-1">
                {product.stockItems.map((si) => (
                  <div key={si.id} className="flex justify-between">
                    <span>{si.store.name}</span>
                    <span className="font-medium">{si.quantity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No stock recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
