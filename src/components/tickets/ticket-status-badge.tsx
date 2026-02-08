import { Badge } from "@/components/ui/badge"
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from "@/lib/constants"
import type { TicketStatus } from "@/generated/prisma"

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="secondary" className={TICKET_STATUS_COLORS[status]}>
      {TICKET_STATUS_LABELS[status]}
    </Badge>
  )
}
