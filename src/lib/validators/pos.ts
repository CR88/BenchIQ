import { z } from "zod"
import { PaymentMethod } from "@/generated/prisma"

export const createInvoiceSchema = z.object({
  ticketId: z.string().optional(),
  customerId: z.string().optional(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number().int().min(1),
      unitPrice: z.number(),
      productId: z.string().optional(),
    })
  ),
})

export const recordPaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().min(0.01),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
})

export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  lineItems: z.array(
    z.object({
      productId: z.string().optional(),
      description: z.string(),
      quantity: z.number().int().min(1),
      unitPrice: z.number(),
    })
  ),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentRef: z.string().optional(),
})

export type CreateSaleInput = z.infer<typeof createSaleSchema>
