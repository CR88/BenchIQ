"use client"

import { useState, useTransition } from "react"
import { useCartStore } from "@/stores/pos-cart-store"
import { createSaleTransaction } from "@/lib/actions/pos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Minus, Plus, Trash2 } from "lucide-react"

interface Product {
  id: string; name: string; sku: string | null; barcode: string | null; retailPrice: number; stock: number
}

export function PosTerminal({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("CARD")
  const [isPending, startTransition] = useTransition()
  const { items, addItem, removeItem, updateQuantity, clearCart, subtotal, taxAmount, total } = useCartStore()

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
    (p.barcode && p.barcode.includes(search))
  )

  function handleAddProduct(product: Product) {
    const existing = items.find((i) => i.productId === product.id)
    if (existing) {
      updateQuantity(existing.id, existing.quantity + 1)
    } else {
      addItem({ productId: product.id, name: product.name, quantity: 1, unitPrice: product.retailPrice })
    }
  }

  function handleCharge() {
    if (items.length === 0) return
    startTransition(async () => {
      try {
        await createSaleTransaction({
          lineItems: items.map((i) => ({
            productId: i.productId,
            description: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          paymentMethod: paymentMethod as any,
        })
        clearCart()
        toast.success("Sale completed")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Sale failed")
      }
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4" />
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.slice(0, 20).map((p) => (
            <Card key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleAddProduct(p)}>
              <CardContent className="p-3">
                <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                <p className="text-sm text-primary">{formatCurrency(p.retailPrice)}</p>
                <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Cart</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && <p className="text-sm text-muted-foreground">No items in cart</p>}
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">{formatCurrency(item.unitPrice)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}><Minus className="h-3 w-3" /></Button>
                <span className="w-6 text-center">{item.quantity}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(item.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
          {items.length > 0 && (
            <>
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal())}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(taxAmount())}</span></div>
                <div className="flex justify-between font-medium text-base"><span>Total</span><span>{formatCurrency(total())}</span></div>
              </div>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleCharge} disabled={isPending}>
                {isPending ? "Processing..." : `Charge ${formatCurrency(total())}`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
