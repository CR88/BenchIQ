"use client"

import { useState, useTransition } from "react"
import { addTicketNote } from "@/lib/actions/tickets"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function TicketNoteForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState("")
  const [isInternal, setIsInternal] = useState(true)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!content.trim()) return

    startTransition(async () => {
      try {
        await addTicketNote(ticketId, content, isInternal)
        setContent("")
        toast.success("Note added")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add note")
      }
    })
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add a note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isInternal}
            onChange={(e) => setIsInternal(e.target.checked)}
            className="rounded"
          />
          Internal note
        </label>
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !content.trim()}>
          {isPending ? "Adding..." : "Add Note"}
        </Button>
      </div>
    </div>
  )
}
