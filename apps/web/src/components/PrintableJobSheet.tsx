'use client'

import { useState } from 'react'
import { Button } from '@benchiq/ui'

interface Customer {
  id: string
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
}

interface Asset {
  name: string
  type: string
  condition?: string
  serialNumber?: string
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
  customer?: Customer
}

interface PrintableJobSheetProps {
  ticket: Ticket
  isOpen: boolean
  onClose: () => void
}

type PrintFormat = 'A4' | 'RECEIPT'

export function PrintableJobSheet({ ticket, isOpen, onClose }: PrintableJobSheetProps) {
  const [printFormat, setPrintFormat] = useState<PrintFormat>('A4')
  const [includeSensitive, setIncludeSensitive] = useState(false)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = generatePrintContent()

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Job Sheet - ${ticket.ticketNumber}</title>
          <style>
            ${getPrintStyles()}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  const generatePrintContent = () => {
    if (printFormat === 'RECEIPT') {
      return generateReceiptFormat()
    } else {
      return generateA4Format()
    }
  }

  const generateA4Format = () => {
    const currentDate = new Date().toLocaleDateString()
    const createdDate = new Date(ticket.createdAt).toLocaleDateString()
    return `
      <div class="a4-sheet">
        <!-- Header -->
        <div class="header">
          <div class="company-info">
            <h1>BenchIQ Repair Shop</h1>
            <p>Professional Computer & Device Repair</p>
          </div>
          <div class="ticket-info">
            <h2>JOB SHEET</h2>
            <p><strong>Ticket #:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Date:</strong> ${currentDate}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="section">
          <h3>Customer Information</h3>
          <div class="customer-grid">
            <div>
              <p><strong>Name:</strong> ${ticket.customer?.firstName} ${ticket.customer?.lastName}</p>
              ${ticket.customer?.companyName ? `<p><strong>Company:</strong> ${ticket.customer.companyName}</p>` : ''}
            </div>
            <div>
              ${ticket.customer?.contact?.email ? `<p><strong>Email:</strong> ${ticket.customer.contact.email}</p>` : ''}
              ${ticket.customer?.contact?.phone ? `<p><strong>Phone:</strong> ${ticket.customer.contact.phone}</p>` : ''}
            </div>
          </div>
          ${ticket.customer?.address ? `
            <p><strong>Address:</strong> ${ticket.customer.address.street}, ${ticket.customer.address.city}, ${ticket.customer.address.state} ${ticket.customer.address.postalCode}</p>
          ` : ''}
        </div>

        <!-- Device Information -->
        ${ticket.assets && ticket.assets.length > 0 ? `
          <div class="section">
            <h3>Device Information</h3>
            ${ticket.assets.map(asset => `
              <div class="device-item">
                <p><strong>Device:</strong> ${asset.name} (${asset.type})</p>
                ${asset.condition ? `<p><strong>Condition:</strong> ${asset.condition}</p>` : ''}
                ${asset.serialNumber ? `<p><strong>Serial:</strong> ${asset.serialNumber}</p>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Problem Description -->
        <div class="section">
          <h3>Problem Description</h3>
          <div class="problem-box">
            <p><strong>Issue:</strong> ${ticket.title}</p>
            <p><strong>Description:</strong> ${ticket.description}</p>
            <p><strong>Customer Statement:</strong> ${ticket.problemDescription}</p>
          </div>
        </div>

        ${includeSensitive && (ticket.computerPassword || ticket.sensitiveData) ? `
          <!-- Sensitive Information -->
          <div class="section sensitive">
            <h3>⚠️ SENSITIVE INFORMATION</h3>
            ${ticket.computerPassword ? `<p><strong>Computer Password:</strong> ${ticket.computerPassword}</p>` : ''}
            ${ticket.sensitiveData ? `<p><strong>Additional Info:</strong> ${ticket.sensitiveData}</p>` : ''}
          </div>
        ` : ''}

        <!-- Work Notes Section -->
        <div class="section">
          <h3>Work Performed</h3>
          <div class="work-notes">
            <div class="note-line"></div>
            <div class="note-line"></div>
            <div class="note-line"></div>
            <div class="note-line"></div>
            <div class="note-line"></div>
            <div class="note-line"></div>
          </div>
        </div>

        <!-- Parts Used Section -->
        <div class="section">
          <h3>Parts & Materials Used</h3>
          <table class="parts-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Part Number</th>
                <th>Qty</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td><td></td></tr>
              <tr><td></td><td></td><td></td><td></td></tr>
              <tr><td></td><td></td><td></td><td></td></tr>
              <tr><td></td><td></td><td></td><td></td></tr>
            </tbody>
          </table>
        </div>

        <!-- Labor Section -->
        <div class="section">
          <h3>Labor & Time</h3>
          <div class="labor-grid">
            <div>
              <p><strong>Start Time:</strong> _____________</p>
              <p><strong>End Time:</strong> _____________</p>
            </div>
            <div>
              <p><strong>Total Hours:</strong> _____________</p>
              <p><strong>Rate:</strong> _____________</p>
            </div>
          </div>
        </div>

        <!-- Completion Section -->
        <div class="section completion">
          <div class="completion-grid">
            <div class="completion-left">
              <p><strong>Technician:</strong> _________________________</p>
              <p><strong>Signature:</strong> _________________________</p>
              <p><strong>Date Completed:</strong> _________________</p>
            </div>
            <div class="completion-right">
              <div class="barcode-section">
                <div class="barcode-container">
                  <div class="barcode-bars">||||| |||| ||| |||| |||||</div>
                  <div class="barcode-text">${ticket.ticketNumber}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Created: ${createdDate} | Printed: ${currentDate}</p>
          <p>Thank you for choosing BenchIQ Repair Shop</p>
        </div>
      </div>
    `
  }

  const generateReceiptFormat = () => {
    const currentDate = new Date().toLocaleDateString()
    const createdDate = new Date(ticket.createdAt).toLocaleDateString()
    return `
      <div class="receipt-sheet">
        <div class="receipt-header">
          <h1>BENCHIQ REPAIR</h1>
          <p>Computer & Device Repair</p>
          <hr>
        </div>

        <div class="receipt-section">
          <p><strong>TICKET: ${ticket.ticketNumber}</strong></p>
          <p>Date: ${createdDate}</p>
          <p>Status: ${ticket.status}</p>
          <hr>
        </div>

        <div class="receipt-section">
          <p><strong>CUSTOMER:</strong></p>
          <p>${ticket.customer?.firstName} ${ticket.customer?.lastName}</p>
          ${ticket.customer?.companyName ? `<p>${ticket.customer.companyName}</p>` : ''}
          ${ticket.customer?.contact?.phone ? `<p>Ph: ${ticket.customer.contact.phone}</p>` : ''}
          <hr>
        </div>

        ${ticket.assets && ticket.assets.length > 0 ? `
          <div class="receipt-section">
            <p><strong>DEVICE(S):</strong></p>
            ${ticket.assets.map(asset => `
              <p>${asset.name} (${asset.type})</p>
              ${asset.condition ? `<p>Condition: ${asset.condition}</p>` : ''}
            `).join('')}
            <hr>
          </div>
        ` : ''}

        <div class="receipt-section">
          <p><strong>PROBLEM:</strong></p>
          <p>${ticket.title}</p>
          <p>${ticket.problemDescription}</p>
          <hr>
        </div>

        ${includeSensitive && ticket.computerPassword ? `
          <div class="receipt-section">
            <p><strong>PASSWORD:</strong></p>
            <p>${ticket.computerPassword}</p>
            <hr>
          </div>
        ` : ''}

        <div class="receipt-section">
          <p><strong>WORK NOTES:</strong></p>
          <br><br><br><br><br>
          <hr>
        </div>

        <div class="receipt-section">
          <p>Tech: _____________</p>
          <br>
          <p>Completed: _________</p>
          <br>
          <div class="receipt-barcode">
            <div class="barcode-bars">||||| |||| ||| |||| |||||</div>
            <div class="barcode-text">${ticket.ticketNumber}</div>
          </div>
          <br>
          <p>Printed: ${currentDate}</p>
        </div>

        <div class="receipt-footer">
          <hr>
          <p>Thank you!</p>
        </div>
      </div>
    `
  }

  const getPrintStyles = () => {
    return `
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
      }

      /* A4 Format Styles */
      .a4-sheet {
        width: 210mm;
        min-height: 297mm;
        padding: 15mm;
        margin: 0 auto;
        background: white;
        font-family: Arial, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #000;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }

      .company-info h1 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
      }

      .company-info p {
        margin: 5px 0 0 0;
        font-size: 14px;
      }

      .ticket-info {
        text-align: right;
      }

      .ticket-info h2 {
        margin: 0;
        font-size: 20px;
        font-weight: bold;
      }

      .ticket-info p {
        margin: 5px 0;
      }

      .section {
        margin-bottom: 20px;
        border: 1px solid #ccc;
        padding: 10px;
      }

      .section h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: bold;
        background: #f0f0f0;
        padding: 5px;
        margin: -10px -10px 10px -10px;
      }

      .customer-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .device-item {
        background: #f9f9f9;
        padding: 8px;
        margin-bottom: 8px;
        border-left: 3px solid #007bff;
      }

      .problem-box {
        background: #fff9c4;
        padding: 10px;
        border-left: 4px solid #ffc107;
      }

      .sensitive {
        background: #ffe6e6;
        border-color: #dc3545;
      }

      .sensitive h3 {
        background: #dc3545;
        color: white;
      }

      .work-notes {
        min-height: 150px;
      }

      .note-line {
        height: 20px;
        border-bottom: 1px solid #ccc;
        margin-bottom: 5px;
      }

      .parts-table {
        width: 100%;
        border-collapse: collapse;
      }

      .parts-table th,
      .parts-table td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
      }

      .parts-table th {
        background: #f0f0f0;
        font-weight: bold;
      }

      .labor-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .completion {
        background: #f8f9fa;
      }

      .completion-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .barcode-section {
        text-align: center;
        padding: 10px;
      }

      .barcode-container {
        display: inline-block;
        border: 2px solid #000;
        padding: 10px;
        background: white;
      }

      .barcode-bars {
        font-family: 'Courier New', monospace;
        font-size: 20px;
        letter-spacing: 2px;
        line-height: 1;
        margin-bottom: 5px;
        color: #000;
      }

      .barcode-text {
        font-size: 12px;
        font-weight: bold;
        letter-spacing: 2px;
      }

      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 10px;
        color: #666;
      }

      /* Receipt Format Styles */
      .receipt-sheet {
        width: 80mm;
        margin: 0 auto;
        padding: 5mm;
        background: white;
        font-family: 'Courier New', monospace;
        font-size: 10px;
        line-height: 1.2;
        color: #000;
      }

      .receipt-header {
        text-align: center;
        margin-bottom: 10px;
      }

      .receipt-header h1 {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
      }

      .receipt-section {
        margin-bottom: 10px;
      }

      .receipt-section p {
        margin: 2px 0;
        word-wrap: break-word;
      }

      .receipt-footer {
        text-align: center;
        margin-top: 10px;
      }

      .receipt-barcode {
        text-align: center;
        margin: 10px 0;
      }

      .receipt-barcode .barcode-bars {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        letter-spacing: 1px;
        margin-bottom: 2px;
      }

      .receipt-barcode .barcode-text {
        font-size: 10px;
        font-weight: bold;
        letter-spacing: 1px;
      }

      hr {
        border: none;
        border-top: 1px dashed #000;
        margin: 5px 0;
      }

      @media screen {
        .a4-sheet {
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          margin: 20px auto;
        }

        .receipt-sheet {
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          margin: 20px auto;
        }
      }
    `
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Print Job Sheet - {ticket.ticketNumber}
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
        <div className="flex">
          {/* Settings Panel */}
          <div className="w-80 p-6 border-r border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Print Settings</h3>

            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Print Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="A4"
                      checked={printFormat === 'A4'}
                      onChange={() => setPrintFormat('A4')}
                      className="mr-2"
                    />
                    <span className="text-sm">📄 A4 - Full Job Sheet</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="RECEIPT"
                      checked={printFormat === 'RECEIPT'}
                      onChange={() => setPrintFormat('RECEIPT')}
                      className="mr-2"
                    />
                    <span className="text-sm">🧾 Receipt - Compact Format</span>
                  </label>
                </div>
              </div>

              {/* Include Sensitive Info */}
              {(ticket.computerPassword || ticket.sensitiveData) && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeSensitive}
                      onChange={(e) => setIncludeSensitive(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">🔒 Include sensitive information</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Computer passwords and sensitive data
                  </p>
                </div>
              )}

              {/* Print Button */}
              <div className="pt-4">
                <Button onClick={handlePrint} className="w-full">
                  🖨️ Print Job Sheet
                </Button>
              </div>

              {/* Format Info */}
              <div className="text-xs text-gray-500 space-y-2">
                <div className="border-t pt-4">
                  <p className="font-medium">Format Details:</p>
                  {printFormat === 'A4' ? (
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Full-size professional job sheet</li>
                      <li>Complete customer & device info</li>
                      <li>Work notes & parts sections</li>
                      <li>Labor tracking & totals</li>
                      <li>Best for desktop/laser printers</li>
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Compact receipt format</li>
                      <li>Essential information only</li>
                      <li>80mm thermal printer compatible</li>
                      <li>Quick reference sheet</li>
                      <li>Perfect for POS printers</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <h3 className="text-lg font-medium mb-4">Preview</h3>

            <div
              className="border border-gray-300 bg-white"
              dangerouslySetInnerHTML={{
                __html: `<style>${getPrintStyles()}</style>${generatePrintContent()}`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}