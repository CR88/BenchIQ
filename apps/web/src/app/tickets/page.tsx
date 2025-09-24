'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@benchiq/ui'
import { DashboardLayout } from '@/components/DashboardLayout'
import { apiClient } from '@/lib/api'
import { TicketNotesModal } from '@/components/TicketNotesModal'
import { PrintableJobSheet } from '@/components/PrintableJobSheet'
import { FileUploadModal } from '@/components/FileUploadModal'

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
  name: string
  type: string
  condition?: string
}

interface Ticket {
  id: string
  ticketNumber: string
  title: string
  description: string
  problemDescription: string
  status: 'NEW' | 'IN_PROGRESS' | 'AWAITING_PARTS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assets: Asset[]
  customerId: string
  createdAt: string
  updatedAt: string
  computerPassword?: string
  notes: Array<{
    id: string
    content: string
    isInternal: boolean
    createdAt: string
  }>
  timeEntries: Array<{
    id: string
    description: string
    hours: number
    date: string
  }>
}

interface TicketWithCustomer extends Ticket {
  customer?: Customer
}

export default function TicketsPage() {
  const { user, logout, isLoading } = useAuth()
  const [tickets, setTickets] = useState<TicketWithCustomer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicketForNotes, setSelectedTicketForNotes] = useState<TicketWithCustomer | null>(null)
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<TicketWithCustomer | null>(null)
  const [selectedTicketForUpload, setSelectedTicketForUpload] = useState<TicketWithCustomer | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch all tickets and customers in parallel
        const [ticketsResponse, customersResponse] = await Promise.all([
          apiClient.getTickets(),
          apiClient.getCustomers()
        ])

        // Filter for active tickets on the frontend
        const activeTickets = ticketsResponse.filter((ticket: Ticket) =>
          ['NEW', 'IN_PROGRESS', 'AWAITING_PARTS'].includes(ticket.status)
        )

        setCustomers(customersResponse)

        // Match customers to active tickets
        const ticketsWithCustomers = activeTickets.map((ticket: Ticket) => ({
          ...ticket,
          customer: customersResponse.find((customer: Customer) => customer.id === ticket.customerId)
        }))

        setTickets(ticketsWithCustomers)
      } catch (error) {
        console.error('Error fetching tickets:', error)
        setError('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'AWAITING_PARTS': return 'bg-orange-100 text-orange-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeOpen = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const days = Math.floor(diffInHours / 24)
      return `${days}d`
    }
  }

  const handlePrint = (ticket: TicketWithCustomer) => {
    setSelectedTicketForPrint(ticket)
  }

  const handleAddNote = (ticket: TicketWithCustomer) => {
    setSelectedTicketForNotes(ticket)
  }

  const handleNoteAdded = async () => {
    // Refresh tickets data to show new note
    try {
      const [ticketsResponse, customersResponse] = await Promise.all([
        apiClient.getTickets(),
        apiClient.getCustomers()
      ])

      const activeTickets = ticketsResponse.filter((ticket: Ticket) =>
        ['NEW', 'IN_PROGRESS', 'AWAITING_PARTS'].includes(ticket.status)
      )

      const ticketsWithCustomers = activeTickets.map((ticket: Ticket) => ({
        ...ticket,
        customer: customersResponse.find((customer: Customer) => customer.id === ticket.customerId)
      }))

      setTickets(ticketsWithCustomers)

      // Update the selected ticket with fresh data
      const updatedTicket = ticketsWithCustomers.find(t => t.id === selectedTicketForNotes?.id)
      if (updatedTicket) {
        setSelectedTicketForNotes(updatedTicket)
      }
    } catch (error) {
      console.error('Error refreshing tickets:', error)
    }
  }

  const handleAddPicture = (ticket: TicketWithCustomer) => {
    setSelectedTicketForUpload(ticket)
  }

  const handleFilesUploaded = (files: Array<{ file: File, preview?: string, id: string }>) => {
    console.log('Files uploaded for ticket:', selectedTicketForUpload?.ticketNumber, files)
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
          <p className="text-gray-600 mb-4">Please log in to access tickets.</p>
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Active Tickets
          </h1>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tickets...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tickets</h3>
              <p className="text-gray-600 mb-6">You don't have any active tickets at the moment.</p>
              <a href="/dashboard">
                <Button>
                  Go to Dashboard
                </Button>
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {tickets.length} Active Ticket{tickets.length !== 1 ? 's' : ''}
                </h2>
                <p className="text-gray-600">
                  Manage your repair tickets and track progress
                </p>
              </div>

              {/* Tickets Grid */}
              <div className="grid gap-6">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-lg">
                              {ticket.ticketNumber}
                            </CardTitle>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {ticket.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>Open for {getTimeOpen(ticket.createdAt)}</div>
                          <div>Created {new Date(ticket.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column - Details */}
                        <div className="space-y-4">
                          {/* Customer Info */}
                          {ticket.customer && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="font-medium">
                                  {ticket.customer.firstName} {ticket.customer.lastName}
                                  {ticket.customer.companyName && (
                                    <span className="text-gray-500"> - {ticket.customer.companyName}</span>
                                  )}
                                </div>
                                {ticket.customer.contact.email && (
                                  <div>📧 {ticket.customer.contact.email}</div>
                                )}
                                {ticket.customer.contact.phone && (
                                  <div>📱 {ticket.customer.contact.phone}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Assets */}
                          {ticket.assets && ticket.assets.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Devices</h4>
                              <div className="space-y-2">
                                {ticket.assets.map((asset, index) => (
                                  <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                                    <span className="font-medium">{asset.name}</span>
                                    <span className="text-gray-500">({asset.type})</span>
                                    {asset.condition && (
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        asset.condition === 'GOOD' ? 'bg-green-100 text-green-800' :
                                        asset.condition === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                        {asset.condition}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Problem Description */}
                          {ticket.problemDescription && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Problem Description</h4>
                              <p className="text-sm text-gray-600">{ticket.problemDescription}</p>
                            </div>
                          )}

                          {/* Computer Password */}
                          {ticket.computerPassword && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Computer Password</h4>
                              <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                {ticket.computerPassword}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Actions & Notes */}
                        <div className="space-y-4">
                          {/* Quick Actions */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrint(ticket)}
                                className="text-xs"
                              >
                                🖨️ Print
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddNote(ticket)}
                                className="text-xs"
                              >
                                📝 Note
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddPicture(ticket)}
                                className="text-xs"
                              >
                                📷 Photo
                              </Button>
                            </div>
                          </div>

                          {/* Recent Notes */}
                          {ticket.notes && ticket.notes.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Recent Notes</h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {ticket.notes.slice(-3).map((note, index) => (
                                  <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                    <div className="font-medium text-gray-700">
                                      {note.isInternal ? '🔒 Internal' : '👤 Customer'}
                                    </div>
                                    <div className="text-gray-600 mt-1">{note.content}</div>
                                    <div className="text-gray-500 mt-1">
                                      {new Date(note.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Time Tracking */}
                          {ticket.timeEntries && ticket.timeEntries.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Time Logged</h4>
                              <div className="text-sm text-gray-600">
                                <div className="font-medium">
                                  Total: {ticket.timeEntries.reduce((sum, entry) => sum + entry.hours, 0)}h
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {ticket.timeEntries.length} entr{ticket.timeEntries.length !== 1 ? 'ies' : 'y'}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

      {/* Notes Modal */}
      {selectedTicketForNotes && (
        <TicketNotesModal
          isOpen={!!selectedTicketForNotes}
          onClose={() => setSelectedTicketForNotes(null)}
          ticket={selectedTicketForNotes}
          onNoteAdded={handleNoteAdded}
        />
      )}

      {/* Print Modal */}
      {selectedTicketForPrint && (
        <PrintableJobSheet
          isOpen={!!selectedTicketForPrint}
          onClose={() => setSelectedTicketForPrint(null)}
          ticket={selectedTicketForPrint}
        />
      )}

      {/* File Upload Modal */}
      {selectedTicketForUpload && (
        <FileUploadModal
          isOpen={!!selectedTicketForUpload}
          onClose={() => setSelectedTicketForUpload(null)}
          ticket={selectedTicketForUpload}
          onFilesUploaded={handleFilesUploaded}
        />
      )}
      </div>
    </DashboardLayout>
  )
}