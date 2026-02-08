import { getInvoices } from "@/lib/queries/invoices"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import Link from "next/link"
import type { InvoiceStatus } from "@/generated/prisma"

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SENT: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-500",
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams
  const invoices = await getInvoices({
    status: status as InvoiceStatus | undefined,
    search,
  })

  return (
    <>
      <PageHeader title="Invoices" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium">Invoice #</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium hidden md:table-cell">Ticket</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium text-right">Total</th>
                  <th className="p-3 font-medium hidden md:table-cell">Due Date</th>
                  <th className="p-3 font-medium hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3 font-medium">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-primary hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="p-3">
                      {invoice.customer
                        ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
                        : "-"}
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">
                      {invoice.ticket?.ticketNumber ?? "-"}
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className={statusColors[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">{formatCurrency(Number(invoice.total))}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {invoice.dueDate ? format(invoice.dueDate, "dd MMM yyyy") : "-"}
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {format(invoice.createdAt, "dd MMM yyyy")}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No invoices yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
