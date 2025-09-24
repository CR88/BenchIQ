import { z } from 'zod'
import { TimestampsSchema } from '../common'

export const DeviceTypeSchema = z.enum([
  'SMARTPHONE',
  'TABLET',
  'LAPTOP',
  'DESKTOP',
  'GAMING_CONSOLE',
  'OTHER'
])

export const DeviceSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  organizationId: z.string().uuid(),
  type: DeviceTypeSchema,
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
  color: z.string().optional(),
  storageCapacity: z.string().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN']).optional(),
  passcode: z.string().optional(),
  accessories: z.array(z.string()).default([]),
  notes: z.string().optional(),
  customFields: z.record(z.string(), z.any()).default({}),
  ...TimestampsSchema.shape,
})

export const CreateDeviceSchema = DeviceSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  serialNumber: true,
  imei: true,
  color: true,
  storageCapacity: true,
  condition: true,
  passcode: true,
  accessories: true,
  notes: true,
  customFields: true,
})

export const UpdateDeviceSchema = CreateDeviceSchema.partial()

export const DeviceSearchSchema = z.object({
  search: z.string().optional(),
  type: DeviceTypeSchema.optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'BROKEN']).optional(),
})

export type Device = z.infer<typeof DeviceSchema>
export type DeviceType = z.infer<typeof DeviceTypeSchema>
export type CreateDeviceRequest = z.infer<typeof CreateDeviceSchema>
export type UpdateDeviceRequest = z.infer<typeof UpdateDeviceSchema>
export type DeviceSearchQuery = z.infer<typeof DeviceSearchSchema>