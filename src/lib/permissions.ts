import { Role } from "@/generated/prisma"

type Permission = string

const PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ["*"],
  MANAGER: [
    "tickets:*", "customers:*", "devices:*", "inventory:*",
    "appointments:*", "pos:*", "reports:read", "storage:*",
    "users:read", "stores:read", "settings:read",
  ],
  TECHNICIAN: [
    "tickets:read", "tickets:update", "tickets:note",
    "devices:read", "inventory:read", "storage:read",
    "appointments:read",
  ],
  STAFF: [
    "tickets:create", "tickets:read", "tickets:update",
    "customers:*", "devices:*", "inventory:read",
    "pos:*", "appointments:create", "appointments:read",
    "storage:read",
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = PERMISSIONS[role]
  if (perms.includes("*")) return true

  const [resource, action] = permission.split(":")
  return perms.some((p) => {
    if (p === permission) return true
    if (p === `${resource}:*`) return true
    return false
  })
}

export function checkPermission(role: Role | undefined, permission: Permission) {
  if (!role || !hasPermission(role, permission)) {
    throw new Error("Unauthorized")
  }
}
