import { z } from 'zod'
import { TimestampsSchema, AddressSchema, ContactInfoSchema } from '../common'

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  contact: ContactInfoSchema,
  address: AddressSchema.optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.any()).default({}),
  ...TimestampsSchema.shape,
})

export const CreateCustomerSchema = CustomerSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  companyName: true,
  address: true,
  notes: true,
  tags: true,
  customFields: true,
})

export const UpdateCustomerSchema = CreateCustomerSchema.partial()

export const CustomerSearchSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  hasAddress: z.boolean().optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
})

export type Customer = z.infer<typeof CustomerSchema>
export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerSchema>
export type CustomerSearchQuery = z.infer<typeof CustomerSearchSchema>