'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@benchiq/ui'
import { AddCustomerModal } from '@/components/AddCustomerModal'
import { DashboardLayout } from '@/components/DashboardLayout'
import { apiClient } from '@/lib/api'

interface Customer {
  id: string
  firstName: string
  lastName: string
  companyName?: string
  contact: {
    email?: string
    phone?: string
  }
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  notes?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function CustomersPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTags, setFilterTags] = useState('')
  const [hasEmailFilter, setHasEmailFilter] = useState<boolean | undefined>(undefined)
  const [hasPhoneFilter, setHasPhoneFilter] = useState<boolean | undefined>(undefined)
  const [hasAddressFilter, setHasAddressFilter] = useState<boolean | undefined>(undefined)

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const searchQuery = {
        search: searchTerm || undefined,
        tags: filterTags || undefined,
        hasEmail: hasEmailFilter,
        hasPhone: hasPhoneFilter,
        hasAddress: hasAddressFilter,
      }

      const data = await apiClient.getCustomers(searchQuery)
      setCustomers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCustomers()
    }
  }, [user, searchTerm, filterTags, hasEmailFilter, hasPhoneFilter, hasAddressFilter])

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      await apiClient.deleteCustomer(id)
      await fetchCustomers() // Refresh the list
    } catch (err) {
      alert('Failed to delete customer: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterTags('')
    setHasEmailFilter(undefined)
    setHasPhoneFilter(undefined)
    setHasAddressFilter(undefined)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to view customers.</p>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Customer
          </Button>
        </div>

        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by name, email, phone, or company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Tags
                    </label>
                    <input
                      type="text"
                      value={filterTags}
                      onChange={(e) => setFilterTags(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Has Email:</label>
                    <select
                      value={hasEmailFilter === undefined ? '' : String(hasEmailFilter)}
                      onChange={(e) => setHasEmailFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Any</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Has Phone:</label>
                    <select
                      value={hasPhoneFilter === undefined ? '' : String(hasPhoneFilter)}
                      onChange={(e) => setHasPhoneFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Any</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Has Address:</label>
                    <select
                      value={hasAddressFilter === undefined ? '' : String(hasAddressFilter)}
                      onChange={(e) => setHasAddressFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Any</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <Button variant="outline" onClick={clearFilters} className="text-sm">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchCustomers}>Try Again</Button>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No customers found.</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                Add Your First Customer
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {customers.map((customer) => (
                <Card key={customer.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </h3>
                          {customer.companyName && (
                            <span className="text-sm text-gray-600">
                              ({customer.companyName})
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Contact</h4>
                            {customer.contact.email && (
                              <p className="text-sm text-gray-600">📧 {customer.contact.email}</p>
                            )}
                            {customer.contact.phone && (
                              <p className="text-sm text-gray-600">📞 {customer.contact.phone}</p>
                            )}
                            {!customer.contact.email && !customer.contact.phone && (
                              <p className="text-sm text-gray-400">No contact info</p>
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Address</h4>
                            {customer.address ? (
                              <p className="text-sm text-gray-600">
                                {customer.address.street}<br />
                                {customer.address.city}, {customer.address.state} {customer.address.postalCode}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400">No address</p>
                            )}
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Tags</h4>
                            {customer.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {customer.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No tags</p>
                            )}
                          </div>
                        </div>

                        {customer.notes && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                            <p className="text-sm text-gray-600">{customer.notes}</p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Created: {new Date(customer.createdAt).toLocaleDateString()}
                          {customer.updatedAt !== customer.createdAt && (
                            <> • Updated: {new Date(customer.updatedAt).toLocaleDateString()}</>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
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

        {/* Add Customer Modal */}
        <AddCustomerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchCustomers}
        />
      </div>
    </DashboardLayout>
  )
}