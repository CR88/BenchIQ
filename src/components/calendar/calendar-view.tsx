"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  extendedProps: {
    type: string
    status: string
    technician?: string
    description?: string | null
  }
}

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium">
          {format(weekStart, "dd MMM")} - {format(addDays(weekStart, 6), "dd MMM yyyy")}
        </h2>
        <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
      </div>
      {/* Mobile agenda view */}
      <div className="md:hidden space-y-2">
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(parseISO(e.start), day))
          if (dayEvents.length === 0) return null
          return (
            <div key={day.toISOString()}>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {format(day, "EEEE, dd MMM")}
              </h3>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div key={event.id} className="rounded bg-primary/10 p-2 text-sm flex items-center gap-3">
                    <span className="text-muted-foreground text-xs shrink-0">
                      {format(parseISO(event.start), "HH:mm")}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      {event.extendedProps.technician && (
                        <p className="text-xs text-muted-foreground">{event.extendedProps.technician}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {days.every((day) => events.filter((e) => isSameDay(parseISO(e.start), day)).length === 0) && (
          <p className="text-sm text-muted-foreground py-4 text-center">No appointments this week</p>
        )}
      </div>

      {/* Desktop weekly grid */}
      <div className="hidden md:grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(parseISO(e.start), day))
          return (
            <Card key={day.toISOString()} className="min-h-[120px]">
              <CardHeader className="p-2">
                <CardTitle className="text-xs">
                  {format(day, "EEE dd")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-1">
                {dayEvents.map((event) => (
                  <div key={event.id} className="rounded bg-primary/10 p-1 text-xs">
                    <p className="font-medium line-clamp-1">{event.title}</p>
                    <p className="text-muted-foreground">
                      {format(parseISO(event.start), "HH:mm")}
                    </p>
                    {event.extendedProps.technician && (
                      <p className="text-muted-foreground">{event.extendedProps.technician}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
