"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, type ProductInput } from "@/lib/validators/inventory"
import { createProduct, updateProduct } from "@/lib/actions/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface InventoryFormProps {
  product?: { id: string; name: string; sku: string | null; barcode: string | null; category: string | null; description: string | null; costPrice: unknown; retailPrice: unknown; reorderPoint: number | null; isService: boolean; isSerialized: boolean }
}

export function InventoryForm({ product }: InventoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<ProductInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      barcode: product?.barcode ?? "",
      category: product?.category ?? "",
      description: product?.description ?? "",
      costPrice: product?.costPrice ? Number(product.costPrice) : undefined,
      retailPrice: product?.retailPrice ? Number(product.retailPrice) : 0,
      reorderPoint: product?.reorderPoint ?? undefined,
      isService: product?.isService ?? false,
      isSerialized: product?.isSerialized ?? false,
    },
  })

  function onSubmit(data: ProductInput) {
    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, data)
          toast.success("Product updated")
        } else {
          await createProduct(data)
          toast.success("Product created")
        }
        router.push("/inventory")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong")
      }
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="barcode" render={({ field }) => (
                <FormItem><FormLabel>Barcode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="costPrice" render={({ field }) => (
                <FormItem><FormLabel>Cost Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="retailPrice" render={({ field }) => (
                <FormItem><FormLabel>Retail Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reorderPoint" render={({ field }) => (
                <FormItem><FormLabel>Reorder Point</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("isService")} className="rounded" /> Service item
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("isSerialized")} className="rounded" /> Serialized
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : product ? "Update" : "Create Product"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
