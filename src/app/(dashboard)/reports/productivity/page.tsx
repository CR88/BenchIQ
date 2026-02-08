import { getProductivityData } from "@/lib/queries/reports"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductivityChart } from "@/components/reports/productivity-chart"

export default async function ProductivityPage() {
  const data = await getProductivityData()

  return (
    <>
      <PageHeader title="Productivity Report" description="Last 30 days" />
      <Card className="mb-6">
        <CardHeader><CardTitle>Technician Performance</CardTitle></CardHeader>
        <CardContent>
          <ProductivityChart data={data} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3 font-medium">Technician</th>
                <th className="p-3 font-medium text-right">Completed (30d)</th>
                <th className="p-3 font-medium text-right">Active</th>
              </tr>
            </thead>
            <tbody>
              {data.map((tech) => (
                <tr key={tech.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{tech.name}</td>
                  <td className="p-3 text-right">{tech.completedCount}</td>
                  <td className="p-3 text-right">{tech.activeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  )
}
