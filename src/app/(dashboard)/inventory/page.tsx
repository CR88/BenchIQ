import { getProducts } from "@/lib/queries/inventory"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const products = await getProducts(search)

  return (
    <>
      <PageHeader
        title="Inventory"
        action={
          <Button asChild>
            <Link href="/inventory/new">Add Product</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium hidden md:table-cell">SKU</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium text-right hidden md:table-cell">Cost</th>
                  <th className="p-3 font-medium text-right">Retail</th>
                  <th className="p-3 font-medium text-right">Stock</th>
                  <th className="p-3 font-medium text-right hidden md:table-cell">Reorder</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stock = product.stockItems.reduce((s, i) => s + i.quantity, 0)
                  const lowStock = product.reorderPoint !== null && stock <= product.reorderPoint
                  return (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">
                        <Link href={"/inventory/" + product.id} className="text-primary hover:underline font-medium">
                          {product.name}
                        </Link>
                        {product.isService && <Badge variant="secondary" className="ml-2 text-xs">Service</Badge>}
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{product.sku || "-"}</td>
                      <td className="p-3">{product.category || "-"}</td>
                      <td className="p-3 text-right hidden md:table-cell">{product.costPrice ? formatCurrency(Number(product.costPrice)) : "-"}</td>
                      <td className="p-3 text-right">{formatCurrency(Number(product.retailPrice))}</td>
                      <td className="p-3 text-right">
                        <span className={lowStock ? "text-red-600 font-medium" : ""}>{stock}</span>
                      </td>
                      <td className="p-3 text-right text-muted-foreground hidden md:table-cell">{product.reorderPoint ?? "-"}</td>
                    </tr>
                  )
                })}
                {products.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
