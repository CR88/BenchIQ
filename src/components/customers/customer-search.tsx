"use client"

import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

export function CustomerSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    startTransition(() => {
      const params = new URLSearchParams()
      if (value) params.set("search", value)
      router.push(`/customers?${params.toString()}`)
    })
  }

  return (
    <Input
      placeholder="Search customers..."
      defaultValue={defaultValue}
      onChange={(e) => handleSearch(e.target.value)}
      className="max-w-sm"
    />
  )
}
