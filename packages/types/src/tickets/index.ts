import { z } from 'zod'
import { TimestampsSchema, MoneyAmountSchema } from '../common'

export const TicketStatusSchema = z.enum([
  'NEW',
  'IN_QUEUE',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'READY',
  'PICKED_UP',
  'CANCELLED'
])

export const TicketPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

export const AssetTypeSchema = z.enum([
  'LAPTOP',
  'DESKTOP',
  'PHONE',
  'TABLET',
  'CHARGER',
  'MOUSE',
  'KEYBOARD',
  'MONITOR',
  'HARD_DRIVE',
  'MEMORY',
  'OTHER'
])

export const AssetSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string().min(1, 'Asset name is required'),
  type: AssetTypeSchema,
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  isTemplate: z.boolean().default(false), // For reusable asset templates
  customFields: z.record(z.string(), z.any()).default({}),
  ...TimestampsSchema.shape,
})

export const TicketAssetSchema = z.object({
  id: z.string().uuid(),
  assetId: z.string().uuid().optional(), // Reference to template asset
  name: z.string().min(1, 'Asset name is required'),
  type: AssetTypeSchema,
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  condition: z.string().optional(),
  notes: z.string().optional(),
})

export const TicketSchema = z.object({
  id: z.string().uuid(),
  ticketNumber: z.string(),
  organizationId: z.string().uuid(),
  customerId: z.string().uuid(),
  deviceId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: TicketStatusSchema,
  priority: TicketPrioritySchema,
  assignedTo: z.string().uuid().optional(),
  problemDescription: z.string(),
  solutionDescription: z.string().optional(),
  estimatedCost: MoneyAmountSchema.optional(),
  actualCost: MoneyAmountSchema.optional(),
  slaTargetAt: z.date().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  pickedUpAt: z.date().optional(),
  tags: z.array(z.string()).default([]),

  // Assets brought in for repair
  assets: z.array(TicketAssetSchema).default([]),

  // Security fields
  computerPassword: z.string().optional(), // Can be printed on job sheets
  sensitiveData: z.string().optional(), // NEVER printed - login credentials etc

  // Barcode for job sheet
  barcodeData: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    url: z.string(),
    size: z.number(),
    mimeType: z.string(),
  })).default([]),
  timeEntries: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    description: z.string(),
    hours: z.number().min(0),
    date: z.date(),
  })).default([]),
  notes: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    content: z.string(),
    isInternal: z.boolean().default(true),
    createdAt: z.date(),
  })).default([]),
  customFields: z.record(z.string(), z.any()).default({}),
  ...TimestampsSchema.shape,
})

export const CreateTicketSchema = TicketSchema.omit({
  id: true,
  ticketNumber: true,
  organizationId: true,
  status: true,
  startedAt: true,
  completedAt: true,
  pickedUpAt: true,
  barcodeData: true,
  attachments: true,
  timeEntries: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  deviceId: true,
  priority: true,
  assignedTo: true,
  solutionDescription: true,
  estimatedCost: true,
  actualCost: true,
  slaTargetAt: true,
  tags: true,
  assets: true,
  computerPassword: true,
  sensitiveData: true,
  customFields: true,
})

export const UpdateTicketSchema = TicketSchema.omit({
  id: true,
  ticketNumber: true,
  organizationId: true,
  customerId: true,
  attachments: true,
  timeEntries: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
}).partial()

export const TicketSearchSchema = z.object({
  search: z.string().optional(),
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  assignedTo: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

export const AddTicketNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  isInternal: z.boolean().default(true),
})

export const AddTimeEntrySchema = z.object({
  description: z.string().min(1, 'Description is required'),
  hours: z.number().min(0.1, 'Hours must be greater than 0'),
  date: z.date().optional(),
})

export type Asset = z.infer<typeof AssetSchema>
export type AssetType = z.infer<typeof AssetTypeSchema>
export type TicketAsset = z.infer<typeof TicketAssetSchema>
export type Ticket = z.infer<typeof TicketSchema>
export type TicketStatus = z.infer<typeof TicketStatusSchema>
export type TicketPriority = z.infer<typeof TicketPrioritySchema>
export type CreateTicketRequest = z.infer<typeof CreateTicketSchema>
export type UpdateTicketRequest = z.infer<typeof UpdateTicketSchema>
export type TicketSearchQuery = z.infer<typeof TicketSearchSchema>
export type AddTicketNoteRequest = z.infer<typeof AddTicketNoteSchema>
export type AddTimeEntryRequest = z.infer<typeof AddTimeEntrySchema>