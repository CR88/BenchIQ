import { z } from 'zod'

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
})

export const IdParamSchema = z.object({
  id: z.string().uuid(),
})

export const SearchQuerySchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string().optional(),
})

export const TimestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const MoneyAmountSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().length(3).default('USD'),
})

export const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().default('US'),
})

export const ContactInfoSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
})

export type Pagination = z.infer<typeof PaginationSchema>
export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
export type IdParam = z.infer<typeof IdParamSchema>
export type SearchQuery = z.infer<typeof SearchQuerySchema>
export type Timestamps = z.infer<typeof TimestampsSchema>
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>
export type Address = z.infer<typeof AddressSchema>
export type ContactInfo = z.infer<typeof ContactInfoSchema>