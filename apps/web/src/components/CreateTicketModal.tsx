'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@benchiq/ui'
import { apiClient } from '@/lib/api'

interface CreateTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  companyName?: string
  contact: {
    email?: string
    phone?: string
  }
}

interface Asset {
  id: string
  name: string
  type: string
  serialNumber?: string
  condition?: string
}

interface TicketFormData {
  customerId: string
  customerSearch: string
  title: string
  description: string
  problemDescription: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assets: Asset[]
  computerPassword: string
  sensitiveData: string
  tags: string

  // Quick customer creation
  quickCustomer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  isCreatingNewCustomer: boolean
}

export function CreateTicketModal({ isOpen, onClose, onSuccess }: CreateTicketModalProps) {
  const [formData, setFormData] = useState<TicketFormData>({
    customerId: '',
    customerSearch: '',
    title: '',
    description: '',
    problemDescription: '',
    priority: 'MEDIUM',
    assets: [],
    computerPassword: '',
    sensitiveData: '',
    tags: '',
    quickCustomer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    isCreatingNewCustomer: false,
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Asset management
  const [currentAsset, setCurrentAsset] = useState({
    name: '',
    type: 'LAPTOP',
    serialNumber: '',
    condition: 'GOOD'
  })

  // Common asset types for quick selection
  const assetTypes = [
    'LAPTOP', 'DESKTOP', 'PHONE', 'TABLET', 'CHARGER', 'MOUSE', 'KEYBOARD',
    'MONITOR', 'PRINTER', 'CABLE', 'HARD_DRIVE', 'MOTHERBOARD', 'RAM', 'OTHER'
  ]

  const assetConditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']

  // Search customers with debouncing
  const searchCustomers = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setCustomers([])
      setShowCustomerDropdown(false)
      return
    }

    setIsSearchingCustomers(true)
    try {
      const response = await apiClient.getCustomers({ search: searchTerm })
      setCustomers(response)
      setShowCustomerDropdown(true)
    } catch (error) {
      console.error('Error searching customers:', error)
      setCustomers([])
    } finally {
      setIsSearchingCustomers(false)
    }
  }, [])

  // Debounced customer search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.customerSearch && !formData.isCreatingNewCustomer) {
        searchCustomers(formData.customerSearch)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [formData.customerSearch, formData.isCreatingNewCustomer, searchCustomers])

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      customerSearch: `${customer.firstName} ${customer.lastName}${customer.companyName ? ` (${customer.companyName})` : ''}`,
      isCreatingNewCustomer: false
    }))
    setShowCustomerDropdown(false)
  }

  const handleCreateNewCustomer = () => {
    setFormData(prev => ({
      ...prev,
      isCreatingNewCustomer: true,
      customerSearch: '',
      customerId: ''
    }))
    setSelectedCustomer(null)
    setShowCustomerDropdown(false)
  }

  const handleCancelNewCustomer = () => {
    setFormData(prev => ({
      ...prev,
      isCreatingNewCustomer: false,
      quickCustomer: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      }
    }))
  }

  const addAsset = () => {
    if (!currentAsset.name.trim()) return

    const newAsset: Asset = {
      id: Date.now().toString(),
      name: currentAsset.name.trim(),
      type: currentAsset.type,
      serialNumber: currentAsset.serialNumber.trim() || undefined,
      condition: currentAsset.condition
    }

    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, newAsset]
    }))

    setCurrentAsset({
      name: '',
      type: 'LAPTOP',
      serialNumber: '',
      condition: 'GOOD'
    })
  }

  const removeAsset = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter(asset => asset.id !== assetId)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Customer validation
    if (formData.isCreatingNewCustomer) {
      if (!formData.quickCustomer.firstName.trim()) {
        newErrors.quickCustomerFirstName = 'First name is required'
      }
      if (!formData.quickCustomer.lastName.trim()) {
        newErrors.quickCustomerLastName = 'Last name is required'
      }
      if (formData.quickCustomer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.quickCustomer.email)) {
        newErrors.quickCustomerEmail = 'Please enter a valid email address'
      }
    } else {
      if (!formData.customerId) {
        newErrors.customerId = 'Please select a customer or create a new one'
      }
    }

    // Ticket validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.problemDescription.trim()) {
      newErrors.problemDescription = 'Problem description is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      let customerId = formData.customerId

      // Create customer if needed
      if (formData.isCreatingNewCustomer) {
        const customerData = {
          firstName: formData.quickCustomer.firstName.trim(),
          lastName: formData.quickCustomer.lastName.trim(),
          contact: {
            email: formData.quickCustomer.email.trim() || undefined,
            phone: formData.quickCustomer.phone.trim() || undefined,
          }
        }

        const newCustomer = await apiClient.createCustomer(customerData)
        customerId = newCustomer.id
      }

      // Create ticket
      const ticketData = {
        customerId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        problemDescription: formData.problemDescription.trim(),
        priority: formData.priority,
        assets: formData.assets.map(asset => ({
          name: asset.name,
          type: asset.type,
          serialNumber: asset.serialNumber,
          condition: asset.condition
        })),
        computerPassword: formData.computerPassword.trim() || undefined,
        sensitiveData: formData.sensitiveData.trim() || undefined,
        tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      }

      await apiClient.createTicket(ticketData)

      // Reset form
      setFormData({
        customerId: '',
        customerSearch: '',
        title: '',
        description: '',
        problemDescription: '',
        priority: 'MEDIUM',
        assets: [],
        computerPassword: '',
        sensitiveData: '',
        tags: '',
        quickCustomer: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        },
        isCreatingNewCustomer: false,
      })
      setSelectedCustomer(null)
      setErrors({})

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error creating ticket:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create ticket' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Create New Repair Ticket</CardTitle>
              <Button variant="outline" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>

                {!formData.isCreatingNewCustomer ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Customer *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.customerSearch}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerSearch: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.customerId ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Search customers by name..."
                      />
                      {isSearchingCustomers && (
                        <div className="absolute right-3 top-2.5">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}

                      {showCustomerDropdown && customers.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {customers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => handleCustomerSelect(customer)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">
                                {customer.firstName} {customer.lastName}
                                {customer.companyName && <span className="text-gray-500"> ({customer.companyName})</span>}
                              </div>
                              {customer.contact.email && (
                                <div className="text-sm text-gray-500">{customer.contact.email}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.customerId && (
                      <p className="text-red-500 text-sm">{errors.customerId}</p>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCreateNewCustomer}
                      className="mt-2"
                    >
                      + Create New Customer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-blue-900">Quick Customer Creation</h4>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelNewCustomer}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.quickCustomer.firstName}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            quickCustomer: { ...prev.quickCustomer, firstName: e.target.value }
                          }))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.quickCustomerFirstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter first name"
                        />
                        {errors.quickCustomerFirstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.quickCustomerFirstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.quickCustomer.lastName}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            quickCustomer: { ...prev.quickCustomer, lastName: e.target.value }
                          }))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.quickCustomerLastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter last name"
                        />
                        {errors.quickCustomerLastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.quickCustomerLastName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.quickCustomer.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            quickCustomer: { ...prev.quickCustomer, email: e.target.value }
                          }))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.quickCustomerEmail ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter email address"
                        />
                        {errors.quickCustomerEmail && (
                          <p className="text-red-500 text-sm mt-1">{errors.quickCustomerEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.quickCustomer.phone}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            quickCustomer: { ...prev.quickCustomer, phone: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ticket Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Ticket Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Laptop not turning on"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of the repair job"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Description *
                  </label>
                  <textarea
                    value={formData.problemDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, problemDescription: e.target.value }))}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.problemDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Detailed description of the problem as described by the customer"
                  />
                  {errors.problemDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.problemDescription}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Assets Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Assets</h3>

                {/* Add Asset Form */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-3">Add Asset</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asset Name
                      </label>
                      <input
                        type="text"
                        value={currentAsset.name}
                        onChange={(e) => setCurrentAsset(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., MacBook Pro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={currentAsset.type}
                        onChange={(e) => setCurrentAsset(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {assetTypes.map(type => (
                          <option key={type} value={type}>{type.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Serial Number
                      </label>
                      <input
                        type="text"
                        value={currentAsset.serialNumber}
                        onChange={(e) => setCurrentAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <select
                        value={currentAsset.condition}
                        onChange={(e) => setCurrentAsset(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {assetConditions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addAsset}
                    disabled={!currentAsset.name.trim()}
                    className="mt-3"
                    size="sm"
                  >
                    Add Asset
                  </Button>
                </div>

                {/* Assets List */}
                {formData.assets.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Added Assets</h4>
                    {formData.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                        <div className="flex-1">
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-gray-500">
                            {asset.type.replace('_', ' ')} • {asset.condition}
                            {asset.serialNumber && ` • SN: ${asset.serialNumber}`}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAsset(asset.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Security Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Security Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Computer Password
                    <span className="text-xs text-green-600 ml-1">(Will be printed on job sheet)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.computerPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, computerPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Device unlock password (visible on job sheet)"
                  />
                  <p className="text-xs text-gray-500 mt-1">This password will be visible on printed job sheets for technician access</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sensitive Login Data
                    <span className="text-xs text-red-600 ml-1">(Secure - NOT printed)</span>
                  </label>
                  <textarea
                    value={formData.sensitiveData}
                    onChange={(e) => setFormData(prev => ({ ...prev, sensitiveData: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Account passwords, PINs, or other sensitive information (never printed)"
                  />
                  <p className="text-xs text-red-600 mt-1">⚠️ This information is encrypted and will NEVER appear on printed job sheets</p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tags separated by commas (e.g., urgent, warranty, data-recovery)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate multiple tags with commas</p>
                </div>
              </div>

              {/* Error Display */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}