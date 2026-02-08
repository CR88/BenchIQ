import { z } from "zod"

export const deviceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  type: z.string().min(1, "Device type is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
  color: z.string().optional(),
  passcode: z.string().optional(),
  notes: z.string().optional(),
})

export type DeviceInput = z.infer<typeof deviceSchema>
