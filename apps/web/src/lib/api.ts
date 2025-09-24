const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Try to get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(data: {
    firstName: string
    lastName: string
    email: string
    password: string
    organizationName: string
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  // Customer endpoints
  async getCustomers(searchQuery?: {
    search?: string
    tags?: string
    hasEmail?: boolean
    hasPhone?: boolean
    hasAddress?: boolean
  }) {
    const params = new URLSearchParams()
    if (searchQuery?.search) params.append('search', searchQuery.search)
    if (searchQuery?.tags) params.append('tags', searchQuery.tags)
    if (searchQuery?.hasEmail !== undefined) params.append('hasEmail', String(searchQuery.hasEmail))
    if (searchQuery?.hasPhone !== undefined) params.append('hasPhone', String(searchQuery.hasPhone))
    if (searchQuery?.hasAddress !== undefined) params.append('hasAddress', String(searchQuery.hasAddress))

    const query = params.toString()
    return this.request(`/customers${query ? `?${query}` : ''}`)
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`)
  }

  async createCustomer(data: {
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
    tags?: string[]
    customFields?: Record<string, any>
  }) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCustomer(id: string, data: Partial<{
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
    tags?: string[]
    customFields?: Record<string, any>
  }>) {
    return this.request(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    })
  }

  async getCustomerStats() {
    return this.request('/customers/stats')
  }

  // Admin endpoints
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

  // Ticket endpoints
  async getTickets(searchQuery?: {
    search?: string
    status?: string
    priority?: string
    customerId?: string
    assignedTo?: string
    tags?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const params = new URLSearchParams()
    if (searchQuery?.search) params.append('search', searchQuery.search)
    if (searchQuery?.status) params.append('status', searchQuery.status)
    if (searchQuery?.priority) params.append('priority', searchQuery.priority)
    if (searchQuery?.customerId) params.append('customerId', searchQuery.customerId)
    if (searchQuery?.assignedTo) params.append('assignedTo', searchQuery.assignedTo)
    if (searchQuery?.tags) params.append('tags', searchQuery.tags)
    if (searchQuery?.dateFrom) params.append('dateFrom', searchQuery.dateFrom)
    if (searchQuery?.dateTo) params.append('dateTo', searchQuery.dateTo)

    const query = params.toString()
    return this.request(`/tickets${query ? `?${query}` : ''}`)
  }

  async getTicket(id: string) {
    return this.request(`/tickets/${id}`)
  }

  async getTicketByNumber(ticketNumber: string) {
    return this.request(`/tickets/number/${ticketNumber}`)
  }

  async createTicket(data: {
    customerId: string
    title: string
    description: string
    problemDescription: string
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    assets?: Array<{
      name: string
      type: string
      serialNumber?: string
      condition?: string
    }>
    computerPassword?: string
    sensitiveData?: string
    tags?: string[]
    customFields?: Record<string, any>
  }) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTicket(id: string, data: any) {
    return this.request(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteTicket(id: string) {
    return this.request(`/tickets/${id}`, {
      method: 'DELETE',
    })
  }

  async addTicketNote(id: string, data: {
    content: string
    isInternal?: boolean
  }) {
    return this.request(`/tickets/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async addTicketTimeEntry(id: string, data: {
    description: string
    hours: number
    date?: string
  }) {
    return this.request(`/tickets/${id}/time`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTicketStats() {
    return this.request('/tickets/stats')
  }

  async searchTicketByBarcode(barcode: string) {
    return this.request(`/tickets/search/${encodeURIComponent(barcode)}`)
  }
}

export const apiClient = new ApiClient(API_URL)