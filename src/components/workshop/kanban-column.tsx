"use client"

import { useDroppable } from "@dnd-kit/core"
import { KanbanCard } from "./kanban-card"
import { TICKET_STATUS_LABELS, TICKET_STATUS_COLORS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TicketStatus } from "@/generated/prisma"

interface KanbanColumnProps {
  status: TicketStatus
  tickets: Array<{
    id: string
    ticketNumber: string
    title: string
    status: TicketStatus
    priority: string
    customer: { firstName: string; lastName: string }
    device: { type: string; brand: string | null; model: string | null }
    assignments: Array<{ user: { name: string } }>
    storageLocation: { label: string } | null
  }>
}

export function KanbanColumn({ status, tickets }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-72 min-h-[500px] rounded-lg bg-muted/40 p-3 snap-center shrink-0",
        isOver && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary" className={TICKET_STATUS_COLORS[status]}>
          {TICKET_STATUS_LABELS[status]}
        </Badge>
        <span className="text-xs text-muted-foreground">{tickets.length}</span>
      </div>
      <div className="flex-1 space-y-2">
        {tickets.map((ticket) => (
          <KanbanCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
