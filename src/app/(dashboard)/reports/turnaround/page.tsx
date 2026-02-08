import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TurnaroundPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const completed = await db.ticket.findMany({
    where: { orgId: session.user.orgId, status: "COMPLETE", completedAt: { not: null } },
    select: { createdAt: true, completedAt: true },
    orderBy: { completedAt: "desc" },
    take: 100,
  })

  const avgHours = completed.length > 0
    ? completed.reduce((sum, t) => sum + (t.completedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60), 0) / completed.length
    : 0

  return (
    <>
      <PageHeader title="Turnaround Report" />
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Average Turnaround</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{avgHours.toFixed(1)} hours</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Completed Tickets</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{completed.length}</p></CardContent>
        </Card>
      </div>
    </>
  )
}
