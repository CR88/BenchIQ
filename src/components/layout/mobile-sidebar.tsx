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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: ClipboardList },
  { href: "/workshop", label: "Workshop", icon: Kanban },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/devices", label: "Devices", icon: Smartphone },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/pos", label: "POS", icon: ShoppingCart },
  { href: "/storage", label: "Storage", icon: MapPin },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function MobileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          BenchIQ
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
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
      </nav>
    </div>
  )
}
