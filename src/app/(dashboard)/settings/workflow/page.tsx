import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { TICKET_STATUS_LABELS, TICKET_WORKFLOW } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { TICKET_STATUS_COLORS } from "@/lib/constants"

export default function WorkflowPage() {
  return (
    <>
      <PageHeader title="Workflow" description="Ticket status workflow configuration" />
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {TICKET_WORKFLOW.map((status, i) => (
              <div key={status} className="flex items-center gap-2">
                <Badge variant="secondary" className={TICKET_STATUS_COLORS[status]}>
                  {TICKET_STATUS_LABELS[status]}
                </Badge>
                {i < TICKET_WORKFLOW.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Custom workflow configuration coming soon.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
