import { z } from 'zod'
import { TimestampsSchema, MoneyAmountSchema } from '../common'

export const EstimateStatusSchema = z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'])

export const LineItemTypeSchema = z.enum(['LABOR', 'PART', 'SERVICE', 'DISCOUNT', 'TAX'])

export const LineItemSchema = z.object({
  id: z.string().uuid(),
  type: LineItemTypeSchema,
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0),
  unitPrice: MoneyAmountSchema,
  discountPercent: z.number().min(0).max(100).default(0),
  taxRate: z.number().min(0).max(1).default(0),
  total: MoneyAmountSchema,
  inventoryItemId: z.string().uuid().optional(),
  sortOrder: z.number().default(0),
})

export const EstimateTotalsSchema = z.object({
  subtotal: MoneyAmountSchema,
  discountAmount: MoneyAmountSchema,
  taxAmount: MoneyAmountSchema,
  total: MoneyAmountSchema,
})

export const EstimateSchema = z.object({
  id: z.string().uuid(),
  estimateNumber: z.string(),
  organizationId: z.string().uuid(),
  customerId: z.string().uuid(),
  ticketId: z.string().uuid().optional(),
  status: EstimateStatusSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  lineItems: z.array(LineItemSchema),
  totals: EstimateTotalsSchema,
  validUntil: z.date().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  sentAt: z.date().optional(),
  acceptedAt: z.date().optional(),
  rejectedAt: z.date().optional(),
  customFields: z.record(z.string(), z.any()).default({}),
  ...TimestampsSchema.shape,
})

export const CreateEstimateSchema = EstimateSchema.omit({
  id: true,
  estimateNumber: true,
  organizationId: true,
  status: true,
  totals: true,
  sentAt: true,
  acceptedAt: true,
  rejectedAt: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  ticketId: true,
  description: true,
  lineItems: true,
  validUntil: true,
  notes: true,
  terms: true,
  customFields: true,
})

export const UpdateEstimateSchema = CreateEstimateSchema.partial()

export const EstimateSearchSchema = z.object({
  search: z.string().optional(),
  status: EstimateStatusSchema.optional(),
  customerId: z.string().uuid().optional(),
  ticketId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

export type Estimate = z.infer<typeof EstimateSchema>
export type EstimateStatus = z.infer<typeof EstimateStatusSchema>
export type LineItem = z.infer<typeof LineItemSchema>
export type LineItemType = z.infer<typeof LineItemTypeSchema>
export type EstimateTotals = z.infer<typeof EstimateTotalsSchema>
export type CreateEstimateRequest = z.infer<typeof CreateEstimateSchema>
export type UpdateEstimateRequest = z.infer<typeof UpdateEstimateSchema>
export type EstimateSearchQuery = z.infer<typeof EstimateSearchSchema>