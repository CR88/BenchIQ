"use client"

import { useTransition } from "react"
import { updateTicketStatus } from "@/lib/actions/tickets"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TICKET_STATUS_LABELS, TICKET_WORKFLOW } from "@/lib/constants"
import { TicketStatusBadge } from "./ticket-status-badge"
import type { TicketStatus } from "@/generated/prisma"
import { toast } from "sonner"

export function TicketStatusChanger({
  ticketId,
  currentStatus,
}: {
  ticketId: string
  currentStatus: TicketStatus
}) {
  const [isPending, startTransition] = useTransition()
  const currentIdx = TICKET_WORKFLOW.indexOf(currentStatus)

  const validNext = TICKET_WORKFLOW.filter((_, i) => {
    if (currentStatus === "CANCELLED") return false
    return i === currentIdx + 1 || i === currentIdx - 1
  }).concat(currentStatus !== "CANCELLED" ? (["CANCELLED"] as TicketStatus[]) : [])

  function handleChange(status: TicketStatus) {
    startTransition(async () => {
      try {
        await updateTicketStatus({ ticketId, status })
        toast.success(`Status updated to ${TICKET_STATUS_LABELS[status]}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update status")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <TicketStatusBadge status={currentStatus} />
        {currentStatus !== "COMPLETE" && currentStatus !== "CANCELLED" && (
          <div className="flex flex-wrap gap-2">
            {validNext.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === "CANCELLED" ? "destructive" : "outline"}
                onClick={() => handleChange(s)}
                disabled={isPending}
              >
                {TICKET_STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
