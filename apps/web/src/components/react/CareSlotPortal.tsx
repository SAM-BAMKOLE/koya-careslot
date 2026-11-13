import type { SyntheticEvent } from "react"
import { useCallback, useEffect, useState } from "react"
import { z } from "zod"

import { clinicApi, ApiError } from "@/lib/clinic-api"
import type { AppointmentSlot, Booking, BookingInput } from "@/lib/clinic-api"

import AppointmentsView from "./AppointmentsView"
import BookView from "./BookView"
import BookingView from "./BookingView"
import LookupView from "./LookupView"
import { localDateKey, type Patient } from "./shared"

type View = "book" | "lookup" | "appointments" | "booking"

type Props = {
  view: View
  bookingId?: string
}

const patientSchema = z.object({
  patientName: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  slotId: z.string().min(1, "Choose an appointment slot."),
})

export default function CareSlotPortal({ view, bookingId }: Props) {
  const [date, setDate] = useState("")

  const [slots, setSlots] = useState<AppointmentSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState("")
  const [patient, setPatient] = useState<Patient>({
    patientName: "",
    email: "",
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [booking, setBooking] = useState<Booking | null>(null)

  const [lookupId, setLookupId] = useState("")

  const [appointmentsEmail, setAppointmentsEmail] = useState("")
  const [appointments, setAppointments] = useState<Booking[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [searchedAppointments, setSearchedAppointments] = useState(false)

  const attachSlotTimes = useCallback(async (bookings: Booking[]) => {
    try {
      const slots = await clinicApi.getSlots()
      const slotsById = new Map(slots.map((slot) => [slot.id, slot]))

      return bookings.map((item) => {
        const slot = slotsById.get(item.slotId)

        return slot ? { ...item, start: slot.start, end: slot.end } : item
      })
    } catch {
      // Slot details are a nice-to-have; never fail the booking itself.
      return bookings
    }
  }, [])

  const loadSlots = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const result = await clinicApi.getSlots()
      const available = result.filter((slot) => slot.available)
      const forDate = date
        ? available.filter((slot) => localDateKey(slot.start) === date)
        : available

      setSlots(forDate)

      setSelectedSlot((current) =>
        forDate.some((slot) => slot.id === current) ? current : ""
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load slots.")
    } finally {
      setLoading(false)
    }
  }, [date])

  const loadBooking = useCallback(
    async (id: string) => {
      setLoading(true)
      setError("")

      try {
        const result = await clinicApi.getBooking(id)
        const [enriched] = await attachSlotTimes([result])
        setBooking(enriched ?? result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Booking not found.")
      } finally {
        setLoading(false)
      }
    },
    [attachSlotTimes]
  )

  const loadAppointments = useCallback(
    async (email: string, cursor?: string) => {
      setLoading(true)
      setError("")

      try {
        const result = await clinicApi.getBookings(email, 10, cursor)
        const items = await attachSlotTimes(result.items)

        setAppointments((current) => (cursor ? [...current, ...items] : items))
        setNextCursor(result.nextCursor)
        setSearchedAppointments(true)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load appointments."
        )
      } finally {
        setLoading(false)
      }
    },
    [attachSlotTimes]
  )

  useEffect(() => {
    if (view === "book") void loadSlots()
  }, [view, loadSlots])

  useEffect(() => {
    if (view === "booking" && bookingId) {
      void loadBooking(bookingId)
    }
  }, [view, bookingId, loadBooking])

  const handleBooking = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setFieldErrors({})

    const result = patientSchema.safeParse({
      ...patient,
      slotId: selectedSlot,
    })

    if (!result.success) {
      const errors: Record<string, string> = {}

      result.error.issues.forEach((issue) => {
        errors[String(issue.path[0])] = issue.message
      })

      setFieldErrors(errors)
      return
    }

    const payload: BookingInput = {
      slot_id: result.data.slotId,
      name: result.data.patientName,
      email: result.data.email,
    }

    setSubmitting(true)

    const storageKey = "careslot.pending-booking"

    try {
      const fingerprintBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(payload))
      )

      const fingerprint = Array.from(new Uint8Array(fingerprintBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")

      const existing = sessionStorage.getItem(storageKey)

      let pending = existing ? JSON.parse(existing) : null

      if (!pending || pending.fingerprint !== fingerprint) {
        pending = {
          key: crypto.randomUUID(),
          fingerprint,
        }

        sessionStorage.setItem(storageKey, JSON.stringify(pending))
      }

      const created = await clinicApi.createBooking(payload, pending.key)

      sessionStorage.removeItem(storageKey)

      window.location.assign(`/booking/${encodeURIComponent(created.id)}`)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(
            "This appointment slot may have just been booked. Please select another available time."
          )
          await loadSlots()
        } else if (err.status === 429) {
          setError(
            `Too many requests. Please try again in ${
              err.retryAfter ?? 30
            } seconds.`
          )
        } else {
          setError(err.message)
        }
      } else {
        // Keep the pending key and payload for a safe retry.
        setError(
          "We couldn't confirm your booking. Retry using the same details to avoid creating a duplicate."
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleLookup = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!lookupId.trim()) {
      setError("Enter your booking reference.")
      return
    }

    window.location.assign(`/booking/${encodeURIComponent(lookupId.trim())}`)
  }

  const handleAppointmentsSearch = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const email = appointmentsEmail.trim()

    if (!email) {
      setError("Enter the email address you used to book.")
      return
    }

    setAppointments([])
    setNextCursor(null)
    await loadAppointments(email)
  }

  const handleLoadMore = () => {
    if (nextCursor) {
      void loadAppointments(appointmentsEmail.trim(), nextCursor)
    }
  }

  const handleCancel = async () => {
    if (!booking) return

    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return
    }

    setSubmitting(true)
    setError("")

    try {
      await clinicApi.cancelBooking(booking.id)
      await loadBooking(booking.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel booking.")
    } finally {
      setSubmitting(false)
    }
  }

  if (view === "book") {
    return (
      <BookView
        date={date}
        setDate={setDate}
        slots={slots}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        patient={patient}
        setPatient={setPatient}
        fieldErrors={fieldErrors}
        loading={loading}
        submitting={submitting}
        error={error}
        loadSlots={loadSlots}
        handleBooking={handleBooking}
      />
    )
  }

  if (view === "lookup") {
    return (
      <LookupView
        lookupId={lookupId}
        setLookupId={setLookupId}
        error={error}
        handleLookup={handleLookup}
      />
    )
  }

  if (view === "appointments") {
    return (
      <AppointmentsView
        appointments={appointments}
        email={appointmentsEmail}
        setEmail={setAppointmentsEmail}
        loading={loading}
        error={error}
        searched={searchedAppointments}
        hasMore={Boolean(nextCursor)}
        onSearch={handleAppointmentsSearch}
        onLoadMore={handleLoadMore}
      />
    )
  }

  if (view === "booking") {
    return (
      <BookingView
        booking={booking}
        loading={loading}
        error={error}
        submitting={submitting}
        handleCancel={handleCancel}
      />
    )
  }

  return null
}
