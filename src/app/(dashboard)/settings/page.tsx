import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Store, Users, Workflow } from "lucide-react"
import Link from "next/link"

const settingsNav = [
  { title: "Organization", description: "Business details, currency, tax", href: "/settings/organization", icon: Building2 },
  { title: "Stores", description: "Manage store locations", href: "/settings/stores", icon: Store },
  { title: "Users", description: "Team members and roles", href: "/settings/users", icon: Users },
  { title: "Workflow", description: "Ticket status workflow", href: "/settings/workflow", icon: Workflow },
]

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-4 md:grid-cols-2">
        {settingsNav.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
