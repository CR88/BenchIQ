"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ClipboardList,
  Kanban,
  Users,
  Smartphone,
  Calendar,
  Package,
  ShoppingCart,
  MapPin,
  BarChart3,
  Settings,
} from "lucide-react"

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/tickets", label: "Tickets", icon: ClipboardList },
      { href: "/workshop", label: "Workshop", icon: Kanban },
    ],
  },
  {
    label: "Customers",
    items: [
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/devices", label: "Devices", icon: Smartphone },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/calendar", label: "Calendar", icon: Calendar },
      { href: "/inventory", label: "Inventory", icon: Package },
      { href: "/pos", label: "POS", icon: ShoppingCart },
      { href: "/storage", label: "Storage", icon: MapPin },
    ],
  },
  {
    label: "Analytics",
    items: [{ href: "/reports", label: "Reports", icon: BarChart3 }],
  },
  {
    label: "Admin",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          BenchIQ
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
