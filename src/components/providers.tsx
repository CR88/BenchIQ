"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import { CommandMenu } from "@/components/layout/command-menu"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <CommandMenu />
      <Toaster position="top-right" richColors />
    </SessionProvider>
  )
}
