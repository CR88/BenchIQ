"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TICKET_STATUS_LABELS } from "@/lib/constants"
import { TicketStatus } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { useTransition } from "react"

const statuses: (TicketStatus | "ALL")[] = [
  "ALL",
  "RECEIVED",
  "DIAGNOSED",
  "WAITING_PARTS",
  "IN_REPAIR",
  "QA",
  "READY_FOR_PICKUP",
  "COMPLETE",
  "CANCELLED",
]

export function TicketFilters({
  currentStatus,
  currentSearch,
}: {
  currentStatus?: string
  currentSearch?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function navigate(status?: string, search?: string) {
    startTransition(() => {
      const params = new URLSearchParams()
      if (status && status !== "ALL") params.set("status", status)
      if (search) params.set("search", search)
      router.push(`/tickets?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {statuses.map((s) => (
          <Button
            key={s}
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs",
              (s === "ALL" && !currentStatus) || currentStatus === s
                ? "bg-primary text-primary-foreground"
                : ""
            )}
            onClick={() => navigate(s, currentSearch)}
          >
            {s === "ALL" ? "All" : TICKET_STATUS_LABELS[s]}
          </Button>
        ))}
      </div>
      <Input
        placeholder="Search tickets..."
        defaultValue={currentSearch}
        onChange={(e) => navigate(currentStatus, e.target.value)}
        className="w-full sm:max-w-sm"
      />
    </div>
  )
}
