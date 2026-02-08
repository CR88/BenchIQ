import { getUsers } from "@/lib/queries/users"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ROLE_LABELS } from "@/lib/constants"

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <>
      <PageHeader title="Team Members" />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium hidden md:table-cell">Stores</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-muted-foreground">{user.email}</td>
                  <td className="p-3"><Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge></td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[150px]">{user.stores.map(s => s.store.name).join(", ") || "-"}</td>
                  <td className="p-3">{user.isActive ? <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
