"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, parseISO, subDays, startOfDay, isSameDay } from "date-fns"

interface Props {
  payments: Array<{ amount: number; date: string }>
  sales: Array<{ amount: number; date: string }>
}

export function RevenueChart({ payments, sales }: Props) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(new Date(), 29 - i)
    const dayStart = startOfDay(day)

    const paymentTotal = payments
      .filter((p) => isSameDay(parseISO(p.date), dayStart))
      .reduce((s, p) => s + p.amount, 0)

    const salesTotal = sales
      .filter((s) => isSameDay(parseISO(s.date), dayStart))
      .reduce((s, t) => s + t.amount, 0)

    return {
      date: format(day, "dd MMM"),
      payments: paymentTotal,
      sales: salesTotal,
      total: paymentTotal + salesTotal,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={days}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
        <Line type="monotone" dataKey="payments" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" />
        <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  )
}
