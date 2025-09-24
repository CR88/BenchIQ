'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@benchiq/ui'
import { AddCustomerModal } from '@/components/AddCustomerModal'
import { CreateTicketModal } from '@/components/CreateTicketModal'
import { DashboardLayout } from '@/components/DashboardLayout'

interface DashboardStats {
  totalCustomers: number;
  openTickets: number;
  totalTickets: number;
  inProgressTickets: number;
  completedToday: number;
}

export default function DashboardPage() {
  const { user, organization, logout, isLoading } = useAuth()
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    openTickets: 0,
    totalTickets: 0,
    inProgressTickets: 0,
    completedToday: 0,
  })
  const [barcodeSearch, setBarcodeSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        const response = await apiClient.request('/dashboard/stats')
        if (response?.stats) {
          setStats(response.stats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [user])

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
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
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
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to {organization?.name}
            </h2>
            <p className="text-gray-600">
              Your repair shop management system is ready. Start managing customers and repair tickets.
            </p>
          </div>

          {/* Barcode Search */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>🔍 Quick Ticket Search</CardTitle>
                <CardDescription>
                  Scan or enter a ticket barcode to instantly find and view the job
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={barcodeSearch}
                    onChange={(e) => setBarcodeSearch(e.target.value)}
                    placeholder="Enter ticket barcode or number..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && barcodeSearch.trim()) {
                        setSearchLoading(true)
                        try {
                          const tickets = await apiClient.request(`/tickets?search=${encodeURIComponent(barcodeSearch.trim())}`)
                          if (response.ok) {
                            const ticket = await response.json()
                            window.location.href = `/tickets?highlight=${ticket.id}`
                          } else {
                            alert('Ticket not found')
                          }
                        } catch (error) {
                          console.error('Search error:', error)
                          alert('Search failed')
                        } finally {
                          setSearchLoading(false)
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={async () => {
                      if (!barcodeSearch.trim()) return
                      setSearchLoading(true)
                      try {
                        const tickets = await apiClient.request(`/tickets?search=${encodeURIComponent(barcodeSearch.trim())}`)
                        if (tickets && tickets.length > 0) {
                          window.location.href = `/tickets?highlight=${tickets[0].id}`
                        } else {
                          alert('Ticket not found')
                        }
                      } catch (error) {
                        console.error('Search error:', error)
                        alert('Search failed')
                      } finally {
                        setSearchLoading(false)
                      }
                    }}
                    disabled={searchLoading || !barcodeSearch.trim()}
                  >
                    {searchLoading ? 'Searching...' : '🔍 Search'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <a href="/customers">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? '...' : stats.totalCustomers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </a>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <a href="/tickets">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-medium">🎫</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Open Tickets</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {statsLoading ? '...' : stats.openTickets}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </a>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Add New Customer</CardTitle>
                <CardDescription>
                  Register a new customer and their devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => setIsAddCustomerModalOpen(true)}
                >
                  Add Customer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create Repair Ticket</CardTitle>
                <CardDescription>
                  Start a new repair job for a customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => setIsCreateTicketModalOpen(true)}
                >
                  New Ticket
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shop Settings</CardTitle>
                <CardDescription>
                  Manage company info, staff, and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => window.location.href = '/settings'}>Settings</Button>
              </CardContent>
            </Card>
          </div>

          {/* Plan Information */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan: {organization?.plan}</CardTitle>
              <CardDescription>
                {organization?.plan === 'FREE'
                  ? `You have ${organization.activeUserLimit} user(s) included in your free plan.`
                  : 'You have unlimited users and all premium features.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {organization?.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              {organization?.plan === 'FREE' && (
                <Button variant="outline">
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={() => {
          // Refresh dashboard stats when a customer is added
          const fetchStats = async () => {
            if (!user) return

            try {
              const response = await apiClient.request('/dashboard/stats')
              if (response?.stats) {
                setStats(response.stats)
              }
            } catch (error) {
              console.error('Error refreshing dashboard stats:', error)
            }
          }

          fetchStats()
          console.log('Customer created successfully!')
        }}
      />

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        onSuccess={() => {
          // Refresh dashboard stats when a ticket is created
          const fetchStats = async () => {
            if (!user) return

            try {
              const response = await apiClient.request('/dashboard/stats')
              if (response?.stats) {
                setStats(response.stats)
              }
            } catch (error) {
              console.error('Error refreshing dashboard stats:', error)
            }
          }

          fetchStats()
          console.log('Ticket created successfully!')
        }}
      />
      </div>
    </DashboardLayout>
  )
}