"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validators/purchase-orders"
import { createPurchaseOrder } from "@/lib/actions/purchase-orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Trash2 } from "lucide-react"

interface PurchaseOrderFormProps {
  suppliers: Array<{ id: string; name: string }>
  products: Array<{ id: string; name: string; sku: string | null; costPrice: unknown }>
}

export function PurchaseOrderForm({ suppliers, products }: PurchaseOrderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<PurchaseOrderInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(purchaseOrderSchema) as any,
    defaultValues: {
      supplierId: "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitCost: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  function onSubmit(data: PurchaseOrderInput) {
    startTransition(async () => {
      try {
        await createPurchaseOrder(data)
        toast.success("Purchase order created")
        router.push("/inventory/purchase-orders")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong")
      }
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: "", quantity: 1, unitCost: 0 })}
                >
                  Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-4 md:grid-cols-[1fr_100px_120px_40px] items-end border rounded-md p-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            const product = products.find((p) => p.id === value)
                            if (product?.costPrice) {
                              form.setValue(`items.${index}.unitCost`, Number(product.costPrice))
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} {p.sku ? `(${p.sku})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitCost`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Cost</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.items?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.items.message}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Purchase Order"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
