"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createTicketSchema, type CreateTicketInput } from "@/lib/validators/tickets"
import { createTicket } from "@/lib/actions/tickets"
import { createDevice } from "@/lib/actions/devices"
import { createCustomer } from "@/lib/actions/customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DEVICE_TYPES } from "@/lib/constants"

interface TicketFormProps {
  customers: Array<{
    id: string
    firstName: string
    lastName: string
    email: string | null
    devices?: Array<{ id: string; type: string; brand: string | null; model: string | null }>
  }>
}

export function TicketForm({ customers }: TicketFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [devices, setDevices] = useState<
    Array<{ id: string; type: string; brand: string | null; model: string | null }>
  >([])
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [showNewDevice, setShowNewDevice] = useState(false)

  const [newCustomer, setNewCustomer] = useState({ firstName: "", lastName: "", email: "", phone: "" })
  const [newDevice, setNewDevice] = useState({ type: "", brand: "", model: "", serialNumber: "" })

  const form = useForm<CreateTicketInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTicketSchema) as any,
    defaultValues: {
      customerId: "",
      deviceId: "",
      title: "",
      description: "",
      priority: "NORMAL",
      intakeNotes: "",
    },
  })

  function handleCustomerSelect(customerId: string) {
    setSelectedCustomerId(customerId)
    form.setValue("customerId", customerId)
    const customer = customers.find((c) => c.id === customerId) as typeof customers[0] & {
      devices?: Array<{ id: string; type: string; brand: string | null; model: string | null }>
    }
    setDevices(customer?.devices ?? [])
    form.setValue("deviceId", "")
  }

  function onSubmit(data: CreateTicketInput) {
    startTransition(async () => {
      try {
        let customerId = data.customerId
        let deviceId = data.deviceId

        if (showNewCustomer) {
          const customer = await createCustomer(newCustomer)
          customerId = customer.id
        }

        if (showNewDevice) {
          const device = await createDevice({
            customerId,
            type: newDevice.type,
            brand: newDevice.brand || undefined,
            model: newDevice.model || undefined,
            serialNumber: newDevice.serialNumber || undefined,
          })
          deviceId = device.id
        }

        const ticket = await createTicket({ ...data, customerId, deviceId })
        toast.success("Ticket created")
        router.push(`/tickets/${ticket.id}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to create ticket")
      }
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {!showNewCustomer ? (
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Customer</FormLabel>
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val)
                              handleCustomerSelect(val)
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.firstName} {c.lastName} {c.email ? `(${c.email})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="link" size="sm" onClick={() => setShowNewCustomer(true)}>
                      + Create new customer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <Input
                          value={newCustomer.firstName}
                          onChange={(e) => setNewCustomer((p) => ({ ...p, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          value={newCustomer.lastName}
                          onChange={(e) => setNewCustomer((p) => ({ ...p, lastName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          value={newCustomer.email}
                          onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button type="button" variant="link" size="sm" onClick={() => setShowNewCustomer(false)}>
                      Select existing customer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Device</CardTitle>
              </CardHeader>
              <CardContent>
                {!showNewDevice ? (
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="deviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Device</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a device" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {devices.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.type} - {d.brand} {d.model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="link" size="sm" onClick={() => setShowNewDevice(true)}>
                      + Add new device
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={newDevice.type}
                          onValueChange={(val) => setNewDevice((p) => ({ ...p, type: val }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Device type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DEVICE_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Brand</label>
                        <Input
                          value={newDevice.brand}
                          onChange={(e) => setNewDevice((p) => ({ ...p, brand: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Model</label>
                        <Input
                          value={newDevice.model}
                          onChange={(e) => setNewDevice((p) => ({ ...p, model: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Serial Number</label>
                        <Input
                          value={newDevice.serialNumber}
                          onChange={(e) => setNewDevice((p) => ({ ...p, serialNumber: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button type="button" variant="link" size="sm" onClick={() => setShowNewDevice(false)}>
                      Select existing device
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Screen replacement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the issue..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intakeNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intake Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Condition, accessories included, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Ticket"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
