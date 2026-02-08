import { Badge } from "@/components/ui/badge"
import { TICKET_STATUS_LABELS } from "@/lib/constants"
import { ArrowRight, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import type { TicketStatus } from "@/generated/prisma"

interface TimelineEntry {
  id: string
  type: "note" | "history"
  createdAt: Date
  user?: { name: string } | null
  content?: string
  isInternal?: boolean
  fromStatus?: TicketStatus | null
  toStatus?: TicketStatus
  note?: string | null
}

interface Props {
  notes: Array<{
    id: string
    content: string
    isInternal: boolean
    createdAt: Date
    user: { name: string }
  }>
  history: Array<{
    id: string
    fromStatus: TicketStatus | null
    toStatus: TicketStatus
    note: string | null
    createdAt: Date
    user: { name: string } | null
  }>
}

export function TicketTimeline({ notes, history }: Props) {
  const entries: TimelineEntry[] = [
    ...notes.map((n) => ({
      id: n.id,
      type: "note" as const,
      createdAt: n.createdAt,
      user: n.user,
      content: n.content,
      isInternal: n.isInternal,
    })),
    ...history.map((h) => ({
      id: h.id,
      type: "history" as const,
      createdAt: h.createdAt,
      user: h.user,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-3">
          <div className="mt-1">
            {entry.type === "history" ? (
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 text-sm">
            {entry.type === "history" ? (
              <p>
                <span className="font-medium">{entry.user?.name ?? "System"}</span>{" "}
                changed status
                {entry.fromStatus && (
                  <>
                    {" "}from <strong>{TICKET_STATUS_LABELS[entry.fromStatus]}</strong>
                  </>
                )}{" "}
                to <strong>{TICKET_STATUS_LABELS[entry.toStatus!]}</strong>
                {entry.note && <span className="text-muted-foreground"> - {entry.note}</span>}
              </p>
            ) : (
              <div>
                <p>
                  <span className="font-medium">{entry.user?.name}</span>
                  {entry.isInternal && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Internal
                    </Badge>
                  )}
                </p>
                <p className="mt-1 text-muted-foreground">{entry.content}</p>
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {format(entry.createdAt, "dd MMM yyyy HH:mm")}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
