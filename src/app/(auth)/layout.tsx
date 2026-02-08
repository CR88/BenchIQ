export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md space-y-6 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">BenchIQ</h1>
          <p className="text-muted-foreground text-sm">Repair Shop Management</p>
        </div>
        {children}
      </div>
    </div>
  )
}
