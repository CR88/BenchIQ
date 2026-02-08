"use client"

import { useSession } from "next-auth/react"
import { hasPermission } from "@/lib/permissions"

export function usePermissions() {
  const { data: session } = useSession()

  return {
    can: (permission: string) => {
      if (!session?.user?.role) return false
      return hasPermission(session.user.role, permission)
    },
  }
}
