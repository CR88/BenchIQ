import { PageHeader } from "@/components/shared/page-header"
import { getAppointments } from "@/lib/queries/appointments"
import { CalendarView } from "@/components/calendar/calendar-view"

export default async function CalendarPage() {
  const appointments = await getAppointments()

  const events = appointments.map((a) => ({
    id: a.id,
    title: a.title,
    start: a.startTime.toISOString(),
    end: a.endTime.toISOString(),
    extendedProps: {
      type: a.type,
      status: a.status,
      technician: a.technician?.name,
      description: a.description,
    },
  }))

  return (
    <>
      <PageHeader title="Calendar" />
      <CalendarView events={events} />
    </>
  )
}
