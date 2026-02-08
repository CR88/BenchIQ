import { getRevenueData } from "@/lib/queries/reports"
import { PageHeader } from "@/components/shared/page-header"
import { RevenueChart } from "@/components/reports/revenue-chart"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function RevenuePage() {
  const { payments, sales } = await getRevenueData(30)

  const totalPayments = payments.reduce((s, p) => s + Number(p.amount), 0)
  const totalSales = sales.reduce((s, t) => s + Number(t.total), 0)

  return (
    <>
      <PageHeader title="Revenue Report" description="Last 30 days" />
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Invoice Payments</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalPayments)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">POS Sales</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(totalSales)}</p></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Daily Revenue</CardTitle></CardHeader>
        <CardContent>
          <RevenueChart payments={payments.map(p => ({ amount: Number(p.amount), date: p.paidAt.toISOString() }))} sales={sales.map(s => ({ amount: Number(s.total), date: s.createdAt.toISOString() }))} />
        </CardContent>
      </Card>
    </>
  )
}
