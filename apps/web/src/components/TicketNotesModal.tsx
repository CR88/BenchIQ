'use client'

import { useState, useEffect } from 'react'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@benchiq/ui'
import { apiClient } from '@/lib/api'

interface Note {
  id: string
  content: string
  isInternal: boolean
  createdAt: string
  userId?: string
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
  status: string
  priority: string
  assets: Asset[]
  customerId: string
  createdAt: string
  updatedAt: string
  computerPassword?: string
  sensitiveData?: string
  notes: Note[]
  customer?: Customer
}

interface TicketNotesModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket
  onNoteAdded?: () => void
}

export function TicketNotesModal({ isOpen, onClose, ticket, onNoteAdded }: TicketNotesModalProps) {
  const [notes, setNotes] = useState<Note[]>(ticket.notes || [])
  const [newNote, setNewNote] = useState('')
  const [isInternal, setIsInternal] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setNotes(ticket.notes || [])
      setNewNote('')
      setIsInternal(true)
      setError(null)
    }
  }, [isOpen, ticket.notes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newNote.trim()) {
      setError('Please enter a note')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Add note via API
      await apiClient.addTicketNote(ticket.id, {
        content: newNote.trim(),
        isInternal
      })

      // Create new note object for immediate UI update
      const addedNote: Note = {
        id: `temp-${Date.now()}`,
        content: newNote.trim(),
        isInternal,
        createdAt: new Date().toISOString(),
        userId: 'current-user'
      }

      setNotes(prev => [...prev, addedNote])
      setNewNote('')

      if (onNoteAdded) {
        onNoteAdded()
      }

    } catch (error) {
      console.error('Error adding note:', error)
      setError('Failed to add note. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Notes & Information - {ticket.ticketNumber}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {ticket.title}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Ticket Information */}
            <div className="space-y-6">
              {/* Customer Info */}
              {ticket.customer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-900">
                        {ticket.customer.firstName} {ticket.customer.lastName}
                      </span>
                      {ticket.customer.companyName && (
                        <span className="text-gray-600 ml-2">- {ticket.customer.companyName}</span>
                      )}
                    </div>
                    {ticket.customer.contact.email && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">Email:</span>
                        <span className="text-sm text-gray-900">{ticket.customer.contact.email}</span>
                      </div>
                    )}
                    {ticket.customer.contact.phone && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">Phone:</span>
                        <span className="text-sm text-gray-900">{ticket.customer.contact.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Devices/Assets */}
              {ticket.assets && ticket.assets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Devices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ticket.assets.map((asset, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{asset.name}</span>
                              <span className="text-gray-600 ml-2">({asset.type})</span>
                            </div>
                            {asset.condition && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                asset.condition === 'GOOD' ? 'bg-green-100 text-green-800' :
                                asset.condition === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {asset.condition}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Problem Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Problem Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.problemDescription}</p>
                </CardContent>
              </Card>

              {/* Sensitive Information */}
              {(ticket.computerPassword || ticket.sensitiveData) && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-yellow-800 flex items-center">
                      🔒 Sensitive Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ticket.computerPassword && (
                      <div>
                        <span className="text-sm font-medium text-yellow-700">Computer Password:</span>
                        <div className="mt-1 font-mono text-sm bg-yellow-100 p-2 rounded border">
                          {ticket.computerPassword}
                        </div>
                      </div>
                    )}
                    {ticket.sensitiveData && (
                      <div>
                        <span className="text-sm font-medium text-yellow-700">Sensitive Data:</span>
                        <div className="mt-1 text-sm bg-yellow-100 p-2 rounded border whitespace-pre-wrap">
                          {ticket.sensitiveData}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Notes */}
            <div className="space-y-6">
              {/* Add New Note */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add New Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="note-type" className="block text-sm font-medium text-gray-700 mb-2">
                        Note Type
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="noteType"
                            checked={isInternal}
                            onChange={() => setIsInternal(true)}
                            className="mr-2"
                          />
                          <span className="text-sm">🔒 Internal Note</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="noteType"
                            checked={!isInternal}
                            onChange={() => setIsInternal(false)}
                            className="mr-2"
                          />
                          <span className="text-sm">👤 Customer Note</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-2">
                        Note Content
                      </label>
                      <textarea
                        id="note-content"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your note here..."
                        disabled={isSubmitting}
                      />
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting || !newNote.trim()}
                      className="w-full"
                    >
                      {isSubmitting ? 'Adding Note...' : 'Add Note'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes History ({notes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>No notes yet</p>
                      <p className="text-sm">Add the first note above</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {notes
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((note, index) => (
                        <div
                          key={note.id || index}
                          className={`border rounded-lg p-4 ${
                            note.isInternal
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                note.isInternal
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {note.isInternal ? '🔒 Internal' : '👤 Customer'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(note.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap text-sm">
                            {note.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}