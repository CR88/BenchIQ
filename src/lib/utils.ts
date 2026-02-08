import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from "nanoid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const nanoid = customAlphabet("0123456789", 5)

export function generateTicketNumber() {
  return `BIQ-${nanoid()}`
}

export function generateInvoiceNumber() {
  return `INV-${nanoid()}`
}

export function generatePONumber() {
  return `PO-${nanoid()}`
}

export function formatCurrency(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function exportToCSV(
  data: Record<string, unknown>[],
  columns: { key: string; label: string }[],
  filename: string
) {
  const header = columns.map((c) => c.label).join(",")
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key]
        const str = val == null ? "" : String(val)
        return str.includes(",") ? `"${str}"` : str
      })
      .join(",")
  )
  const csv = [header, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
