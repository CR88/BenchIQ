import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">Page not found</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
