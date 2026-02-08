import { z } from "zod"
import { TicketPriority, TicketStatus, DeviceCondition } from "@/generated/prisma"

export const createTicketSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  deviceId: z.string().min(1, "Device is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(TicketPriority),
  conditionOnIntake: z.nativeEnum(DeviceCondition).optional(),
  intakeNotes: z.string().optional(),
  storageLocationId: z.string().optional(),
})

export const updateTicketStatusSchema = z.object({
  ticketId: z.string(),
  status: z.nativeEnum(TicketStatus),
  note: z.string().optional(),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>
