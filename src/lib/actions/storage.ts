"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { storageLocationSchema } from "@/lib/validators/storage"
import { checkPermission } from "@/lib/permissions"
import { revalidatePath } from "next/cache"

export async function createStorageLocation(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "storage:create")

  const data = storageLocationSchema.parse(input)
  const location = await db.storageLocation.create({
    data: { ...data, storeId: session.user.activeStoreId! },
  })

  revalidatePath("/storage")
  return location
}

export async function deleteStorageLocation(locationId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "storage:delete")

  await db.storageLocation.delete({ where: { id: locationId } })
  revalidatePath("/storage")
}
