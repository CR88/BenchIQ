import { z } from 'zod'
import { TimestampsSchema, AddressSchema, ContactInfoSchema } from '../common'

export const OrganizationPlanSchema = z.enum(['FREE', 'PRO'])

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Organization name is required'),
  description: z.string().optional(),
  logo: z.string().optional(),
  plan: OrganizationPlanSchema,
  activeUserLimit: z.number().min(1),
  settings: z.object({
    timezone: z.string().default('America/New_York'),
    currency: z.string().length(3).default('USD'),
    dateFormat: z.string().default('MM/dd/yyyy'),
    timeFormat: z.enum(['12h', '24h']).default('12h'),
    taxRate: z.number().min(0).max(1).default(0),
    businessHours: z.object({
      monday: z.object({ open: z.string(), close: z.string() }).nullable(),
      tuesday: z.object({ open: z.string(), close: z.string() }).nullable(),
      wednesday: z.object({ open: z.string(), close: z.string() }).nullable(),
      thursday: z.object({ open: z.string(), close: z.string() }).nullable(),
      friday: z.object({ open: z.string(), close: z.string() }).nullable(),
      saturday: z.object({ open: z.string(), close: z.string() }).nullable(),
      sunday: z.object({ open: z.string(), close: z.string() }).nullable(),
    }),
  }),
  address: AddressSchema.optional(),
  contact: ContactInfoSchema.optional(),
  ...TimestampsSchema.shape,
})

export const CreateOrganizationSchema = OrganizationSchema.omit({
  id: true,
  plan: true,
  activeUserLimit: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  settings: true,
  address: true,
  contact: true,
})

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial()

export const OrganizationSettingsSchema = OrganizationSchema.shape.settings

export type Organization = z.infer<typeof OrganizationSchema>
export type OrganizationPlan = z.infer<typeof OrganizationPlanSchema>
export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationSchema>
export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationSchema>
export type OrganizationSettings = z.infer<typeof OrganizationSettingsSchema>