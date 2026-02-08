"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Props {
  data: Array<{ name: string; completedCount: number; activeCount: number }>
}

export function ProductivityChart({ data }: Props) {
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No data available.</p>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="completedCount" name="Completed" fill="#10b981" />
        <Bar dataKey="activeCount" name="Active" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}
