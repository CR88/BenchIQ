import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

const reports = [
  { title: "Revenue", description: "Track income from repairs and sales", href: "/reports/revenue", icon: TrendingUp },
  { title: "Productivity", description: "Technician performance metrics", href: "/reports/productivity", icon: BarChart3 },
  { title: "Turnaround", description: "Average repair completion times", href: "/reports/turnaround", icon: Clock },
]

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" />
      <div className="grid gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-3">
                <report.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
