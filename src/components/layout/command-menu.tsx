"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  Calendar,
  Settings,
  Kanban,
  ShoppingCart,
  BarChart3,
} from "lucide-react"

const pages = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tickets", href: "/tickets", icon: ClipboardList },
  { label: "Workshop", href: "/workshop", icon: Kanban },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "POS", href: "/pos", icon: ShoppingCart },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type to search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {pages.map((page) => (
            <CommandItem key={page.href} onSelect={() => navigate(page.href)}>
              <page.icon className="mr-2 h-4 w-4" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
