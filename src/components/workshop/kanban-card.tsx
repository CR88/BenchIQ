"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { TicketPriority } from "@/generated/prisma"

interface KanbanCardProps {
  ticket: {
    id: string
    ticketNumber: string
    title: string
    priority: string
    customer: { firstName: string; lastName: string }
    device: { type: string; brand: string | null; model: string | null }
    assignments: Array<{ user: { name: string } }>
    storageLocation: { label: string } | null
  }
  isDragging?: boolean
}

export function KanbanCard({ ticket, isDragging }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: ticket.id,
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Link
            href={`/tickets/${ticket.id}`}
            className="text-xs text-primary hover:underline font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {ticket.ticketNumber}
          </Link>
          <Badge
            variant="secondary"
            className={cn("text-xs", PRIORITY_COLORS[ticket.priority as TicketPriority])}
          >
            {PRIORITY_LABELS[ticket.priority as TicketPriority]}
          </Badge>
        </div>
        <p className="text-sm font-medium line-clamp-2">{ticket.title}</p>
        <p className="text-xs text-muted-foreground">
          {ticket.customer.firstName} {ticket.customer.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          {ticket.device.brand} {ticket.device.model}
        </p>
        {ticket.assignments.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {ticket.assignments.map((a) => a.user.name).join(", ")}
          </p>
        )}
        {ticket.storageLocation && (
          <p className="text-xs text-muted-foreground">
            Storage: {ticket.storageLocation.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
