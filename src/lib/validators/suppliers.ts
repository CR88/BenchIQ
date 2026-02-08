import { z } from "zod"

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
})

export type SupplierInput = z.infer<typeof supplierSchema>
