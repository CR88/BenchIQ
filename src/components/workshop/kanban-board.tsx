"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { updateTicketStatus } from "@/lib/actions/tickets"
import { TICKET_WORKFLOW, TICKET_STATUS_LABELS } from "@/lib/constants"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import type { TicketStatus } from "@/generated/prisma"

type TicketData = {
  id: string
  ticketNumber: string
  title: string
  status: TicketStatus
  priority: string
  customer: { firstName: string; lastName: string }
  device: { type: string; brand: string | null; model: string | null }
  assignments: Array<{ user: { name: string } }>
  storageLocation: { label: string } | null
}

interface KanbanBoardProps {
  initialGroups: Record<TicketStatus, TicketData[]>
}

export function KanbanBoard({ initialGroups }: KanbanBoardProps) {
  const [groups, setGroups] = useState(initialGroups)
  const [activeTicket, setActiveTicket] = useState<TicketData | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragStart(event: DragStartEvent) {
    const ticket = Object.values(groups)
      .flat()
      .find((t) => t.id === event.active.id)
    setActiveTicket(ticket ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTicket(null)
    const { active, over } = event
    if (!over) return

    const newStatus = over.id as TicketStatus
    const ticket = Object.values(groups)
      .flat()
      .find((t) => t.id === active.id)
    if (!ticket || ticket.status === newStatus) return

    // Optimistic update
    setGroups((prev) => {
      const updated = { ...prev }
      updated[ticket.status] = updated[ticket.status].filter((t) => t.id !== ticket.id)
      updated[newStatus] = [...updated[newStatus], { ...ticket, status: newStatus }]
      return updated
    })

    try {
      await updateTicketStatus({ ticketId: ticket.id, status: newStatus })
      toast.success(`Moved to ${TICKET_STATUS_LABELS[newStatus]}`)
    } catch {
      setGroups(initialGroups)
      toast.error("Failed to update status")
    }
  }

  return (
    <ScrollArea className="w-full overflow-x-auto [&>div>div]:snap-x [&>div>div]:snap-mandatory [-webkit-overflow-scrolling:touch]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 pb-4 min-w-max">
          {TICKET_WORKFLOW.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tickets={groups[status] ?? []}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTicket && <KanbanCard ticket={activeTicket} isDragging />}
        </DragOverlay>
      </DndContext>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
