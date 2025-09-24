'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@benchiq/ui'
import { DashboardLayout } from '@/components/DashboardLayout'

export default function EstimatesPage() {
  const { user, isLoading } = useAuth()
  const [estimates, setEstimates] = useState([])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access estimates.</p>
          <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Estimates</h1>
          <p className="text-gray-600 mt-2">Create and manage repair estimates</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📝 Active Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-gray-600 text-sm mt-2">Pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>✅ Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-gray-600 text-sm mt-2">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💵 Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$0</p>
              <p className="text-gray-600 text-sm mt-2">Quoted this month</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Estimates</CardTitle>
            <CardDescription>
              View and manage customer estimates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates yet</h3>
              <p className="text-gray-600 mb-6">Create your first estimate for a customer</p>
              <Button>Create Estimate</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}