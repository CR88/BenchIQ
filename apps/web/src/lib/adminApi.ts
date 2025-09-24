const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

class AdminApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Try to get admin token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('adminAccessToken')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminAccessToken', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminAccessToken')
      localStorage.removeItem('adminRefreshToken')
      localStorage.removeItem('adminUser')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Admin Auth endpoints
  async adminLogin(credentials: { email: string; password: string }) {
    return this.request('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async getAdminProfile() {
    return this.request('/admin/auth/profile')
  }

  async adminChangePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request('/admin/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Admin Organization endpoints
  async getOrganizations(filters?: {
    status?: string
    plan?: string
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.plan) params.append('plan', filters.plan)
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString()
    return this.request(`/admin/organizations${query ? `?${query}` : ''}`)
  }

  async getOrganization(id: string) {
    return this.request(`/admin/organizations/${id}`)
  }

  async createOrganization(data: {
    name: string
    plan: 'FREE' | 'PRO' | 'ENTERPRISE'
    billingEmail: string
    activeUserLimit?: number
  }) {
    return this.request('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateOrganization(id: string, data: any) {
    return this.request(`/admin/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async suspendOrganization(id: string, reason?: string) {
    return this.request(`/admin/organizations/${id}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    })
  }

  async reactivateOrganization(id: string) {
    return this.request(`/admin/organizations/${id}/reactivate`, {
      method: 'PATCH',
    })
  }

  async deleteOrganization(id: string) {
    return this.request(`/admin/organizations/${id}`, {
      method: 'DELETE',
    })
  }

  async getOrganizationStats() {
    return this.request('/admin/organizations/stats')
  }
}

export const adminApiClient = new AdminApiClient(API_URL)