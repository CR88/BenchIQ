import { z } from "zod"

export const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  notes: z.string().optional(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
})

export type CustomerInput = z.infer<typeof customerSchema>
