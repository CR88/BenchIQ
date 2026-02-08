import { z } from "zod"
import { AppointmentType, AppointmentStatus } from "@/generated/prisma"

export const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.nativeEnum(AppointmentType).default("IN_STORE"),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  technicianId: z.string().optional(),
  customerId: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
