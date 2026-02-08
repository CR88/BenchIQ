import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  costPrice: z.coerce.number().optional(),
  retailPrice: z.coerce.number().min(0, "Retail price is required"),
  reorderPoint: z.coerce.number().int().optional(),
  isService: z.boolean(),
  isSerialized: z.boolean(),
})

export type ProductInput = z.infer<typeof productSchema>
