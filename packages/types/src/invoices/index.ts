import { z } from 'zod'
import { TimestampsSchema, MoneyAmountSchema } from '../common'
import { LineItemSchema, EstimateTotalsSchema } from '../estimates'

export const InvoiceStatusSchema = z.enum(['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'])

export const PaymentMethodSchema = z.enum(['CASH', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'OTHER'])

export const PaymentSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  organizationId: z.string().uuid(),
  amount: MoneyAmountSchema,
  method: PaymentMethodSchema,
  reference: z.string().optional(),
  notes: z.string().optional(),
  processedBy: z.string().uuid(),
  processedAt: z.date(),
  ...TimestampsSchema.shape,
})

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string(),
  organizationId: z.string().uuid(),
  customerId: z.string().uuid(),
  ticketId: z.string().uuid().optional(),
  estimateId: z.string().uuid().optional(),
  status: InvoiceStatusSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  lineItems: z.array(LineItemSchema),
  totals: EstimateTotalsSchema,
  dueDate: z.date().optional(),
  paidAmount: MoneyAmountSchema,
  balanceDue: MoneyAmountSchema,
  payments: z.array(PaymentSchema).default([]),
  notes: z.string().optional(),
  terms: z.string().optional(),
  sentAt: z.date().optional(),
  paidAt: z.date().optional(),
  customFields: z.record(z.string(), z.any()).default({}),
  ...TimestampsSchema.shape,
})

export const CreateInvoiceSchema = InvoiceSchema.omit({
  id: true,
  invoiceNumber: true,
  organizationId: true,
  status: true,
  totals: true,
  paidAmount: true,
  balanceDue: true,
  payments: true,
  sentAt: true,
  paidAt: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  ticketId: true,
  estimateId: true,
  description: true,
  lineItems: true,
  dueDate: true,
  notes: true,
  terms: true,
  customFields: true,
})

export const UpdateInvoiceSchema = CreateInvoiceSchema.partial()

export const InvoiceSearchSchema = z.object({
  search: z.string().optional(),
  status: InvoiceStatusSchema.optional(),
  customerId: z.string().uuid().optional(),
  ticketId: z.string().uuid().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  overdue: z.boolean().optional(),
})

export const CreatePaymentSchema = PaymentSchema.omit({
  id: true,
  invoiceId: true,
  organizationId: true,
  processedBy: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  reference: true,
  notes: true,
})

export type Invoice = z.infer<typeof InvoiceSchema>
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>
export type Payment = z.infer<typeof PaymentSchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceSchema>
export type UpdateInvoiceRequest = z.infer<typeof UpdateInvoiceSchema>
export type InvoiceSearchQuery = z.infer<typeof InvoiceSearchSchema>
export type CreatePaymentRequest = z.infer<typeof CreatePaymentSchema>