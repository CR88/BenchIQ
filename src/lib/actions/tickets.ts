"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createTicketSchema, updateTicketStatusSchema } from "@/lib/validators/tickets"
import { checkPermission } from "@/lib/permissions"
import { generateTicketNumber } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function createTicket(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "tickets:create")

  const data = createTicketSchema.parse(input)

  const ticket = await db.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({
      data: {
        ...data,
        ticketNumber: generateTicketNumber(),
        orgId: session.user.orgId,
        storeId: session.user.activeStoreId!,
      },
    })

    await tx.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        userId: session.user.id,
        toStatus: "RECEIVED",
        note: "Ticket created",
      },
    })

    return ticket
  })

  revalidatePath("/tickets")
  revalidatePath("/workshop")
  return ticket
}

export async function updateTicketStatus(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "tickets:update")

  const { ticketId, status, note } = updateTicketStatusSchema.parse(input)

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId, orgId: session.user.orgId },
  })
  if (!ticket) throw new Error("Ticket not found")

  const updated = await db.$transaction(async (tx) => {
    const updated = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(status === "COMPLETE" && { completedAt: new Date() }),
      },
    })

    await tx.ticketHistory.create({
      data: {
        ticketId,
        userId: session.user.id,
        fromStatus: ticket.status,
        toStatus: status,
        note,
      },
    })

    return updated
  })

  revalidatePath("/tickets")
  revalidatePath("/tickets/" + ticketId)
  revalidatePath("/workshop")
  return updated
}

export async function assignTicket(ticketId: string, userId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "tickets:update")

  await db.ticketAssignment.create({
    data: { ticketId, userId },
  })

  revalidatePath("/tickets/" + ticketId)
  revalidatePath("/workshop")
}

export async function addTicketNote(ticketId: string, content: string, isInternal = true) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "tickets:note")

  await db.ticketNote.create({
    data: {
      ticketId,
      userId: session.user.id,
      content,
      isInternal,
    },
  })

  revalidatePath("/tickets/" + ticketId)
}

export async function addLineItem(
  ticketId: string,
  data: {
    productId?: string
    description: string
    quantity: number
    unitPrice: number
    isLabor: boolean
  }
) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "tickets:update")

  await db.ticketLineItem.create({
    data: {
      ticketId,
      productId: data.productId || null,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      isLabor: data.isLabor,
    },
  })

  if (data.productId && !data.isLabor) {
    await db.stockItem.updateMany({
      where: {
        productId: data.productId,
        storeId: session.user.activeStoreId!,
      },
      data: { quantity: { decrement: data.quantity } },
    })
  }

  revalidatePath("/tickets/" + ticketId)
}

export async function removeLineItem(lineItemId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "tickets:update")

  const item = await db.ticketLineItem.delete({ where: { id: lineItemId } })
  revalidatePath("/tickets/" + item.ticketId)
}
