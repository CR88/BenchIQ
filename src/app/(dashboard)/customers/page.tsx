import { getCustomers } from "@/lib/queries/customers"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { format } from "date-fns"
import { CustomerSearch } from "@/components/customers/customer-search"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const customers = await getCustomers(search)

  return (
    <>
      <PageHeader
        title="Customers"
        action={
          <Button asChild>
            <Link href="/customers/new">Add Customer</Link>
          </Button>
        }
      />

      <div className="mb-4">
        <CustomerSearch defaultValue={search} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium hidden md:table-cell">Email</th>
                  <th className="p-3 font-medium hidden md:table-cell">Phone</th>
                  <th className="p-3 font-medium">Tickets</th>
                  <th className="p-3 font-medium">Devices</th>
                  <th className="p-3 font-medium hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {customer.firstName} {customer.lastName}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[150px]">{customer.email || "-"}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{customer.phone || "-"}</td>
                    <td className="p-3">{customer._count.tickets}</td>
                    <td className="p-3">{customer._count.devices}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {format(customer.createdAt, "dd MMM yyyy")}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {search ? "No customers found matching your search." : "No customers yet."}
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
