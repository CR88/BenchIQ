"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { deviceSchema } from "@/lib/validators/devices"
import { checkPermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function createDevice(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "devices:create")

  const data = deviceSchema.parse(input)

  const device = await db.device.create({
    data: { ...data, orgId: session.user.orgId },
  })

  revalidatePath("/devices")
  revalidatePath("/customers/" + data.customerId)
  return device
}

export async function updateDevice(deviceId: string, input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "devices:update")

  const data = deviceSchema.parse(input)

  const device = await db.device.update({
    where: { id: deviceId, orgId: session.user.orgId },
    data,
  })

  revalidatePath("/devices")
  revalidatePath("/devices/" + deviceId)
  return device
}

export async function deleteDevice(deviceId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "devices:delete")

  await db.device.delete({
    where: { id: deviceId, orgId: session.user.orgId },
  })

  revalidatePath("/devices")
}
