import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getUserStores() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const userStores = await db.userStore.findMany({
    where: { userId: session.user.id },
    include: { store: true },
  })

  return userStores.map((us) => us.store)
}

export async function getOrganization() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.organization.findUnique({
    where: { id: session.user.orgId },
  })
}
