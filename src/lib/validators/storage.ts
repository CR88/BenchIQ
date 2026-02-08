import { z } from "zod"

export const storageLocationSchema = z.object({
  zone: z.string().min(1, "Zone is required"),
  shelf: z.string().min(1, "Shelf is required"),
  bin: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  notes: z.string().optional(),
})

export type StorageLocationInput = z.infer<typeof storageLocationSchema>
