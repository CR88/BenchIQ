'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@benchiq/ui'
import { DashboardLayout } from '@/components/DashboardLayout'

interface OrganizationSettings {
  name: string
  description?: string
  logo?: string
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  contact?: {
    email?: string
    phone?: string
    website?: string
  }
  currency: string
}

interface StaffMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'ADMIN' | 'STAFF'
  tier: 1 | 2
  isActive: boolean
  createdAt: string
}

export default function SettingsPage() {
  const { user, organization, logout, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'company' | 'staff' | 'security'>('company')
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: '',
    currency: 'USD'
  })
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    if (organization) {
      setOrgSettings({
        name: organization.name || '',
        description: organization.description || '',
        logo: organization.logo || '',
        currency: organization.currency || 'USD'
      })
    }
  }, [organization])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCompanyInfo = async () => {
    setIsUpdating(true)
    try {
      // First upload logo if there's a new one
      if (logoFile) {
        const formData = new FormData()
        formData.append('logo', logoFile)

        const logoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/current/logo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: formData,
        })

        if (!logoResponse.ok) {
          throw new Error('Failed to upload logo')
        }

        const logoResult = await logoResponse.json()
        // Update orgSettings with new logo URL
        setOrgSettings(prev => ({ ...prev, logo: logoResult.logoUrl }))
      }

      // Update organization settings
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizations/current`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          name: orgSettings.name,
          description: orgSettings.description,
          settings: {
            currency: orgSettings.currency,
          },
          address: orgSettings.address,
          contact: orgSettings.contact,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update organization settings')
      }

      alert('Company settings updated successfully!')
      setLogoFile(null)
      setLogoPreview(null)
    } catch (error) {
      console.error('Error updating company settings:', error)
      alert('Failed to update company settings')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      // TODO: Implement API call to change password
      console.log('Changing password')
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password')
    }
  }

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
          <p className="text-gray-600 mb-4">Please log in to access settings.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('company')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'company'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏢 Company Info
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'staff'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Staff Management
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔒 Security
              </button>
            </nav>
          </div>

          {/* Company Info Tab */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Manage your repair shop details and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="shrink-0">
                        {logoPreview || orgSettings.logo ? (
                          <img
                            className="h-20 w-20 object-cover rounded-lg border"
                            src={logoPreview || orgSettings.logo}
                            alt="Company logo"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded-lg border flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Logo</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 2MB. Will appear on printed job sheets.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={orgSettings.name}
                      onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your Repair Shop Name"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={orgSettings.description || ''}
                      onChange={(e) => setOrgSettings({ ...orgSettings, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of your repair shop services"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={orgSettings.currency}
                      onChange={(e) => setOrgSettings({ ...orgSettings, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="CAD">CAD - Canadian Dollar (C$)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                    </select>
                  </div>

                  {/* Address Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Business Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={orgSettings.address?.street || ''}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            address: { ...orgSettings.address, street: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={orgSettings.address?.city || ''}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            address: { ...orgSettings.address, city: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={orgSettings.address?.state || ''}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            address: { ...orgSettings.address, state: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="State/Province"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={orgSettings.address?.postalCode || ''}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            address: { ...orgSettings.address, postalCode: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="12345"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          value={orgSettings.address?.country || ''}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            address: { ...orgSettings.address, country: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Country</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Email
                        </label>
                        <input
                          type="email"
                          value={orgSettings.contact?.email || ''}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            contact: { ...orgSettings.contact, email: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="contact@yourshop.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Phone
                        </label>
                        <input
                          type="tel"
                          value={orgSettings.contact?.phone || ''}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            contact: { ...orgSettings.contact, phone: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <input
                          type="url"
                          value={orgSettings.contact?.website || ''}
                          onChange={(e) => setOrgSettings({
                            ...orgSettings,
                            contact: { ...orgSettings.contact, website: e.target.value } as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://yourshop.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleSaveCompanyInfo}
                      disabled={isUpdating || !orgSettings.name}
                      className="w-full md:w-auto"
                    >
                      {isUpdating ? 'Saving...' : 'Save Company Information'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Staff Management Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Members</CardTitle>
                  <CardDescription>
                    Manage staff accounts and permissions. Tier 1 has admin access, Tier 2 has limited access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button>Add New Staff Member</Button>
                  </div>

                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">🚧 Staff management coming soon!</p>
                    <p className="text-sm">This feature will allow you to:</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Add and remove staff members</li>
                      <li>• Set Tier 1 (admin) or Tier 2 (limited) permissions</li>
                      <li>• Reset staff passwords</li>
                      <li>• Manage active/inactive status</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">🚧 Password management coming soon!</p>
                    <p className="text-sm">This feature will allow you to:</p>
                    <ul className="text-sm mt-2 space-y-1">
                      <li>• Change your own password</li>
                      <li>• Reset staff member passwords</li>
                      <li>• Set password policies</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}