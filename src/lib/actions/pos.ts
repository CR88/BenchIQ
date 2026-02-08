"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createSaleSchema } from "@/lib/validators/pos"
import { checkPermission } from "@/lib/permissions"
import { generateInvoiceNumber } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function createInvoiceFromTicket(ticketId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "pos:create")

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId, orgId: session.user.orgId },
    include: { lineItems: true, customer: true },
  })
  if (!ticket) throw new Error("Ticket not found")

  const org = await db.organization.findUnique({ where: { id: session.user.orgId } })
  const taxRate = org ? Number(org.taxRate) : 0.2

  const subtotal = ticket.lineItems.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0)
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const invoice = await db.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      orgId: session.user.orgId,
      storeId: session.user.activeStoreId!,
      ticketId,
      customerId: ticket.customerId,
      subtotal,
      taxRate,
      taxAmount,
      total,
    },
  })

  revalidatePath("/tickets/" + ticketId)
  return invoice
}

export async function recordPayment(invoiceId: string, amount: number, method: string, reference?: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "pos:create")

  await db.payment.create({
    data: {
      invoiceId,
      amount,
      method: method as any,
      reference,
    },
  })

  const payments = await db.payment.findMany({ where: { invoiceId } })
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0)
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } })

  if (invoice && totalPaid >= Number(invoice.total)) {
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date() },
    })
  }

  revalidatePath("/pos")
}

export async function createSaleTransaction(input: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  checkPermission(session.user.role, "pos:create")

  const data = createSaleSchema.parse(input)
  const org = await db.organization.findUnique({ where: { id: session.user.orgId } })
  const taxRate = org ? Number(org.taxRate) : 0.2

  const subtotal = data.lineItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const sale = await db.$transaction(async (tx) => {
    const sale = await tx.saleTransaction.create({
      data: {
        storeId: session.user.activeStoreId!,
        userId: session.user.id,
        customerId: data.customerId || null,
        subtotal,
        taxAmount,
        total,
        paymentMethod: data.paymentMethod,
        paymentRef: data.paymentRef,
        lineItems: {
          create: data.lineItems.map((item) => ({
            productId: item.productId || null,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })

    for (const item of data.lineItems) {
      if (item.productId) {
        await tx.stockItem.updateMany({
          where: { productId: item.productId, storeId: session.user.activeStoreId! },
          data: { quantity: { decrement: item.quantity } },
        })
      }
    }

    return sale
  })

  revalidatePath("/pos")
  revalidatePath("/inventory")
  return sale
}
