'use client'

import { Navigation } from './Navigation'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main content area with responsive padding */}
      <div className="md:pl-64">
        {/* Mobile header spacer */}
        <div className="md:hidden h-16" />
        
        {/* Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}