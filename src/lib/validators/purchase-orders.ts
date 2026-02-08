import { z } from "zod"

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().int().min(1),
    unitCost: z.coerce.number().min(0),
  })).min(1, "At least one item is required"),
})

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>
