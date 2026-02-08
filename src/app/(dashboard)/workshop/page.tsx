import { getTicketsByStatus } from "@/lib/queries/tickets"
import { PageHeader } from "@/components/shared/page-header"
import { KanbanBoard } from "@/components/workshop/kanban-board"
import { TICKET_WORKFLOW } from "@/lib/constants"
import type { TicketStatus } from "@/generated/prisma"

export default async function WorkshopPage() {
  const tickets = await getTicketsByStatus()

  // Serialize to plain objects for client component (Decimal/Date not serializable)
  const serialized = tickets.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    title: t.title,
    status: t.status,
    priority: t.priority,
    customer: { firstName: t.customer.firstName, lastName: t.customer.lastName },
    device: { type: t.device.type, brand: t.device.brand, model: t.device.model },
    assignments: t.assignments.map((a) => ({ user: { name: a.user.name } })),
    storageLocation: t.storageLocation ? { label: t.storageLocation.label } : null,
  }))

  const grouped = TICKET_WORKFLOW.reduce(
    (acc, status) => {
      acc[status] = serialized.filter((t) => t.status === status)
      return acc
    },
    {} as Record<TicketStatus, typeof serialized>
  )

  return (
    <>
      <PageHeader title="Workshop" description="Drag tickets between columns to update status" />
      <KanbanBoard initialGroups={grouped} />
    </>
  )
}
