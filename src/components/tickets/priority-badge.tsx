import { Badge } from "@/components/ui/badge"
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants"
import type { TicketPriority } from "@/generated/prisma"

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant="secondary" className={PRIORITY_COLORS[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
