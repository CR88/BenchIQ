'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@benchiq/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@benchiq/ui'
import { Input } from '@benchiq/ui'
import { countries } from '@/lib/countries'

export default function SetupPage() {
  const router = useRouter()
  const { user, organization } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    country: organization?.country || '',
  })

  useEffect(() => {
    // Redirect if user doesn't need setup
    if (user && !organization) {
      // Wait for organization to load
      return
    }

    if (user && organization) {
      // Check if setup is actually required
      // This would ideally come from the auth response
      // For now, we'll assume if they're here, they need setup
    }
  }, [user, organization, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          password: formData.password,
          country: formData.country,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Setup completed:', data)

        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Setup failed')
      }
    } catch (err) {
      console.error('Setup error:', err)
      setError('Setup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to complete your account setup.</p>
          <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-blue-600">BenchIQ</span>
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Complete Your Account Setup
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome, {user.firstName}! Please set your password and confirm your business location.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Location
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Enter your new password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Confirm your new password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}