import { TicketStatus, TicketPriority, Role } from "@/generated/prisma"

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  RECEIVED: "Received",
  DIAGNOSED: "Diagnosed",
  WAITING_PARTS: "Waiting for Parts",
  IN_REPAIR: "In Repair",
  QA: "Quality Check",
  READY_FOR_PICKUP: "Ready for Pickup",
  COMPLETE: "Complete",
  CANCELLED: "Cancelled",
}

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  RECEIVED: "bg-blue-100 text-blue-800",
  DIAGNOSED: "bg-purple-100 text-purple-800",
  WAITING_PARTS: "bg-yellow-100 text-yellow-800",
  IN_REPAIR: "bg-orange-100 text-orange-800",
  QA: "bg-indigo-100 text-indigo-800",
  READY_FOR_PICKUP: "bg-green-100 text-green-800",
  COMPLETE: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export const TICKET_WORKFLOW: TicketStatus[] = [
  "RECEIVED",
  "DIAGNOSED",
  "WAITING_PARTS",
  "IN_REPAIR",
  "QA",
  "READY_FOR_PICKUP",
  "COMPLETE",
]

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
}

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  TECHNICIAN: "Technician",
  STAFF: "Staff",
}

export const DEVICE_TYPES = [
  "Phone",
  "Laptop",
  "Tablet",
  "Desktop",
  "Console",
  "Smartwatch",
  "Other",
] as const
