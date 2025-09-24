'use client'

import { useAuth } from '@/hooks/useAuth'
import { getCountryByCode } from '@/lib/countries'

export function useOrganizationLocation() {
  const { organization } = useAuth()

  const countryConfig = organization?.country ? getCountryByCode(organization.country) : null

  return {
    country: organization?.country || null,
    countryConfig,
    isLoading: !organization
  }
}