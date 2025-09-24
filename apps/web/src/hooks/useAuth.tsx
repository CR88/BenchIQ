'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  organizationId: string
}

interface Organization {
  id: string
  name: string
  plan: string
  activeUserLimit: number
  features: string[]
  country: string
}

interface AuthContextType {
  user: User | null
  organization: Organization | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  organizationName: string
  country: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token and user data on mount
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      const storedUser = localStorage.getItem('user')
      const storedOrganization = localStorage.getItem('organization')

      if (token && storedUser && storedOrganization) {
        try {
          apiClient.setToken(token)
          setUser(JSON.parse(storedUser))
          setOrganization(JSON.parse(storedOrganization))
        } catch (error) {
          // If there's an error parsing stored data, clear it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          localStorage.removeItem('organization')
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password })

      setUser(response.user)
      setOrganization(response.organization)
      apiClient.setToken(response.accessToken)

      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('organization', JSON.stringify(response.organization))
      }

      // Check if first-time setup is required
      if (response.requiresSetup) {
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/setup'
        }
        return
      }
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await apiClient.register(data)

      setUser(response.user)
      setOrganization(response.organization)
      apiClient.setToken(response.accessToken)

      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('organization', JSON.stringify(response.organization))
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setOrganization(null)
    apiClient.clearToken()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('organization')
    }
  }

  const value = {
    user,
    organization,
    isLoading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}