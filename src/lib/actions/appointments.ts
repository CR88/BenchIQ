"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { appointmentSchema } from "@/lib/validators/appointments"
import { checkPermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function createAppointment(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "appointments:create")

  const data = appointmentSchema.parse(input)
  const appointment = await db.appointment.create({
    data: { ...data, storeId: session.user.activeStoreId! },
  })

  revalidatePath("/calendar")
  return appointment
}

export async function updateAppointment(appointmentId: string, input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "appointments:create")

  const data = appointmentSchema.parse(input)
  const appointment = await db.appointment.update({
    where: { id: appointmentId },
    data,
  })

  revalidatePath("/calendar")
  return appointment
}

export async function deleteAppointment(appointmentId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "appointments:create")

  await db.appointment.delete({ where: { id: appointmentId } })
  revalidatePath("/calendar")
}
