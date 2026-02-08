import { PageHeader } from "@/components/shared/page-header"
import { TicketForm } from "@/components/tickets/ticket-form"
import { getCustomers } from "@/lib/queries/customers"

export default async function NewTicketPage() {
  const customers = await getCustomers()

  return (
    <>
      <PageHeader title="New Ticket" />
      <TicketForm customers={customers} />
    </>
  )
}
