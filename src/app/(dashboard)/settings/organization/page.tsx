import { getOrganization } from "@/lib/queries/stores"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OrganizationSettingsPage() {
  const org = await getOrganization()
  if (!org) return null

  return (
    <>
      <PageHeader title="Organization Settings" />
      <Card>
        <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div><p className="text-muted-foreground">Name</p><p className="font-medium">{org.name}</p></div>
            <div><p className="text-muted-foreground">Email</p><p className="font-medium">{org.email || "-"}</p></div>
            <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{org.phone || "-"}</p></div>
            <div><p className="text-muted-foreground">Currency</p><p className="font-medium">{org.defaultCurrency}</p></div>
            <div><p className="text-muted-foreground">Tax Rate</p><p className="font-medium">{(Number(org.taxRate) * 100).toFixed(0)}%</p></div>
            <div><p className="text-muted-foreground">Timezone</p><p className="font-medium">{org.timezone}</p></div>
            <div><p className="text-muted-foreground">Plan</p><p className="font-medium">{org.plan}</p></div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
