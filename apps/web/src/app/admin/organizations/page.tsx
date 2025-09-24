'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@benchiq/ui'

interface Organization {
  id: string
  name: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
  activeUserLimit: number
  features: string[]
  billingEmail: string
  createdAt: string
  updatedAt: string
  lastPaymentAt?: string
  nextBillingDate?: string
  monthlyRevenue: number
  userCount: number
  ticketCount?: number
  storageUsed?: number
}

export default function AdminOrganizationsPage() {
  const { user, logout } = useAdminAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    plan: 'FREE' as 'FREE' | 'PRO' | 'ENTERPRISE',
    billingEmail: '',
    ownerFirstName: '',
    ownerLastName: '',
    country: 'GB',
    activeUserLimit: 1
  })
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchOrganizations()
    }
  }, [user, searchTerm, statusFilter, planFilter])

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (planFilter) params.append('plan', planFilter)

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/organizations${params.toString() ? '?' + params.toString() : ''}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrganizations(data)
        setError(null)
      } else {
        setError('Failed to fetch organizations')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuspend = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this organization?')) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/organizations/${id}/suspend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      })
      if (response.ok) {
        await fetchOrganizations() // Refresh the list
      } else {
        alert('Failed to suspend organization')
      }
    } catch (err) {
      alert('Failed to suspend organization: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/organizations/${id}/reactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      })
      if (response.ok) {
        await fetchOrganizations() // Refresh the list
      } else {
        alert('Failed to reactivate organization')
      }
    } catch (err) {
      alert('Failed to reactivate organization: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this organization? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/organizations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
      })
      if (response.ok) {
        await fetchOrganizations() // Refresh the list
      } else {
        alert('Failed to delete organization')
      }
    } catch (err) {
      alert('Failed to delete organization: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleCreateOrganization = async () => {
    if (!createForm.name.trim() || !createForm.billingEmail.trim() || !createForm.ownerFirstName.trim() || !createForm.ownerLastName.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}`,
        },
        body: JSON.stringify({
          name: createForm.name.trim(),
          plan: createForm.plan,
          billingEmail: createForm.billingEmail.trim(),
          ownerFirstName: createForm.ownerFirstName.trim(),
          ownerLastName: createForm.ownerLastName.trim(),
          country: createForm.country,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTemporaryPassword(result.temporaryPassword)

        // Refresh the list
        await fetchOrganizations()
      } else {
        const errorData = await response.json()
        alert('Failed to create organization: ' + (errorData.message || 'Unknown error'))
      }
    } catch (err) {
      alert('Failed to create organization: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsCreating(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access the admin panel.</p>
          <a href="/admin/login" className="text-blue-600 hover:text-blue-500">
            Go to Admin Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="text-blue-600">BenchIQ</span> Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {user.firstName} {user.lastName}
              </div>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/admin/dashboard"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Dashboard
            </a>
            <a
              href="/admin/organizations"
              className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
            >
              Organizations
            </a>
            <a
              href="/admin/billing"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Billing
            </a>
            <a
              href="/admin/settings"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Settings
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Organization Management</CardTitle>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Organization
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search organizations..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan
                  </label>
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Plans</option>
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('')
                      setPlanFilter('')
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizations List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading organizations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchOrganizations}>Try Again</Button>
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No organizations found.</p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create First Organization
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {organizations.map((org) => (
                <Card key={org.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {org.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            org.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            org.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {org.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            org.plan === 'FREE' ? 'bg-gray-100 text-gray-800' :
                            org.plan === 'PRO' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {org.plan}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Contact</h4>
                            <p className="text-sm text-gray-600">{org.billingEmail}</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Users</h4>
                            <p className="text-sm text-gray-600">
                              {org.userCount} / {org.activeUserLimit === -1 ? 'Unlimited' : org.activeUserLimit}
                            </p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Revenue</h4>
                            <p className="text-sm text-gray-600">£{org.monthlyRevenue.toFixed(2)}/month</p>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Created</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(org.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Features</h4>
                          <div className="flex flex-wrap gap-1">
                            {org.features.map((feature, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        {org.storageUsed !== undefined && (
                          <div className="text-xs text-gray-500">
                            Storage: {org.storageUsed}MB
                            {org.ticketCount !== undefined && ` • Tickets: ${org.ticketCount}`}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {org.status === 'ACTIVE' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspend(org.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivate(org.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Reactivate
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(org.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create Organization</h3>

            {temporaryPassword ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-800 mb-2">Organization Created Successfully!</h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <p><strong>Organization:</strong> {createForm.name}</p>
                    <p><strong>Owner Email:</strong> {createForm.billingEmail}</p>
                    <p><strong>Temporary Password:</strong> <code className="bg-green-100 px-2 py-1 rounded">{temporaryPassword}</code></p>
                  </div>
                  <p className="text-xs text-green-600 mt-3">
                    Send this temporary password to the business owner. They will be prompted to change it and complete their setup on first login.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowCreateModal(false)
                    setTemporaryPassword(null)
                    setCreateForm({
                      name: '',
                      plan: 'FREE',
                      billingEmail: '',
                      ownerFirstName: '',
                      ownerLastName: '',
                      country: 'GB',
                      activeUserLimit: 1
                    })
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      value={createForm.billingEmail}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, billingEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter owner email"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner First Name *
                      </label>
                      <input
                        type="text"
                        value={createForm.ownerFirstName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, ownerFirstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Last Name *
                      </label>
                      <input
                        type="text"
                        value={createForm.ownerLastName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, ownerLastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plan
                      </label>
                      <select
                        value={createForm.plan}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, plan: e.target.value as 'FREE' | 'PRO' | 'ENTERPRISE' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="FREE">Free</option>
                        <option value="PRO">Pro</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={createForm.country}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setShowCreateModal(false)
                      setCreateForm({
                        name: '',
                        plan: 'FREE',
                        billingEmail: '',
                        ownerFirstName: '',
                        ownerLastName: '',
                        country: 'GB',
                        activeUserLimit: 1
                      })
                    }}
                    variant="outline"
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateOrganization}
                    disabled={isCreating || !createForm.name.trim() || !createForm.billingEmail.trim() || !createForm.ownerFirstName.trim() || !createForm.ownerLastName.trim()}
                  >
                    {isCreating ? 'Creating...' : 'Create Organization'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}