import { z } from 'zod'
import { TimestampsSchema, MoneyAmountSchema } from '../common'

export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  cost: MoneyAmountSchema,
  price: MoneyAmountSchema,
  quantity: z.number().min(0),
  reorderLevel: z.number().min(0).default(0),
  location: z.string().optional(),
  supplier: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    unit: z.enum(['cm', 'in']).default('cm'),
  }).optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.any()).default({}),
  ...TimestampsSchema.shape,
})

export const CreateInventoryItemSchema = InventoryItemSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  description: true,
  category: true,
  manufacturer: true,
  model: true,
  reorderLevel: true,
  location: true,
  supplier: true,
  barcode: true,
  weight: true,
  dimensions: true,
  isActive: true,
  tags: true,
  customFields: true,
})

export const UpdateInventoryItemSchema = CreateInventoryItemSchema.partial()

export const InventoryAdjustmentSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  inventoryItemId: z.string().uuid(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number(),
  reason: z.string(),
  notes: z.string().optional(),
  userId: z.string().uuid(),
  ...TimestampsSchema.shape,
})

export const CreateInventoryAdjustmentSchema = InventoryAdjustmentSchema.omit({
  id: true,
  organizationId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  notes: true,
})

export const InventorySearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  supplier: z.string().optional(),
  lowStock: z.boolean().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export type InventoryItem = z.infer<typeof InventoryItemSchema>
export type CreateInventoryItemRequest = z.infer<typeof CreateInventoryItemSchema>
export type UpdateInventoryItemRequest = z.infer<typeof UpdateInventoryItemSchema>
export type InventoryAdjustment = z.infer<typeof InventoryAdjustmentSchema>
export type CreateInventoryAdjustmentRequest = z.infer<typeof CreateInventoryAdjustmentSchema>
export type InventorySearchQuery = z.infer<typeof InventorySearchSchema>