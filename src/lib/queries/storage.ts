import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getStorageLocations() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.storageLocation.findMany({
    where: { storeId: session.user.activeStoreId ?? undefined },
    include: { tickets: { select: { id: true, ticketNumber: true, title: true } } },
    orderBy: [{ zone: "asc" }, { shelf: "asc" }, { bin: "asc" }],
  })
}
