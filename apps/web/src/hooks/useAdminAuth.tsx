'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { adminApiClient } from '@/lib/adminApi'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing admin token and user data on mount
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminAccessToken')
      const storedUser = localStorage.getItem('adminUser')

      if (token && storedUser) {
        try {
          adminApiClient.setToken(token)
          setUser(JSON.parse(storedUser))
        } catch (error) {
          // If there's an error parsing stored data, clear it
          localStorage.removeItem('adminAccessToken')
          localStorage.removeItem('adminRefreshToken')
          localStorage.removeItem('adminUser')
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await adminApiClient.adminLogin({ email, password })

      setUser(response.user)
      adminApiClient.setToken(response.accessToken)

      if (typeof window !== 'undefined') {
        localStorage.setItem('adminAccessToken', response.accessToken)
        localStorage.setItem('adminRefreshToken', response.refreshToken)
        localStorage.setItem('adminUser', JSON.stringify(response.user))
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    adminApiClient.clearToken()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminAccessToken')
      localStorage.removeItem('adminRefreshToken')
      localStorage.removeItem('adminUser')
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await adminApiClient.adminChangePassword({ currentPassword, newPassword })
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    changePassword,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}