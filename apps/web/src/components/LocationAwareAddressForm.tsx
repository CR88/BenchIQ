'use client'

import { useState, useEffect } from 'react'
import { getCountryByCode, Country } from '@/lib/countries'

interface AddressFormData {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface LocationAwareAddressFormProps {
  address: AddressFormData
  onChange: (address: AddressFormData) => void
  organizationCountry?: string
  disabled?: boolean
  className?: string
}

export default function LocationAwareAddressForm({
  address,
  onChange,
  organizationCountry,
  disabled = false,
  className = ''
}: LocationAwareAddressFormProps) {
  const [countryConfig, setCountryConfig] = useState<Country | null>(null)

  useEffect(() => {
    const defaultCountry = organizationCountry || address.country || 'GB'
    const config = getCountryByCode(defaultCountry)
    setCountryConfig(config)

    // If no country is set in address, default to organization country
    if (!address.country && organizationCountry) {
      onChange({
        ...address,
        country: organizationCountry
      })
    }
  }, [organizationCountry, address.country])

  const handleFieldChange = (field: keyof AddressFormData, value: string) => {
    onChange({
      ...address,
      [field]: value
    })
  }

  const validatePostalCode = (value: string): boolean => {
    if (!countryConfig?.addressFormat.postalCodePattern) return true
    const pattern = new RegExp(countryConfig.addressFormat.postalCodePattern)
    return pattern.test(value)
  }

  if (!countryConfig) {
    return <div>Loading address form...</div>
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input
          type="text"
          value={address.street}
          onChange={(e) => handleFieldChange('street', e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Enter street address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {countryConfig.addressFormat.stateLabel}
          </label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder={`Enter ${countryConfig.addressFormat.stateLabel.toLowerCase()}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {countryConfig.addressFormat.postalCodeLabel}
          </label>
          <input
            type="text"
            value={address.postalCode}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              address.postalCode && !validatePostalCode(address.postalCode)
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
            placeholder={`Enter ${countryConfig.addressFormat.postalCodeLabel.toLowerCase()}`}
          />
          {address.postalCode && !validatePostalCode(address.postalCode) && (
            <p className="text-sm text-red-600 mt-1">
              Please enter a valid {countryConfig.addressFormat.postalCodeLabel.toLowerCase()} for {countryConfig.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <input
            type="text"
            value={countryConfig.name}
            disabled={true}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
          />
          <p className="text-xs text-gray-500 mt-1">
            Country is set based on your organization's location
          </p>
        </div>
      </div>
    </div>
  )
}