import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function getAppointments(startDate?: Date, endDate?: Date) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  return db.appointment.findMany({
    where: {
      storeId: session.user.activeStoreId ?? undefined,
      ...(startDate && endDate && {
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      }),
    },
    include: { technician: true },
    orderBy: { startTime: "asc" },
  })
}
