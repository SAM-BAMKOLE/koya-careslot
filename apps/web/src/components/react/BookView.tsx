import type { SyntheticEvent } from "react"

import {
  RiArrowRightLine,
  RiCalendarLine,
  RiCheckLine,
  RiLoader4Line,
  RiShieldCheckLine,
  RiTimeLine,
} from "@remixicon/react"

import type { AppointmentSlot } from "@/lib/clinic-api"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import {
  ErrorMessage,
  LoadingCards,
  SectionHeading,
  formatDate,
  formatTime,
  localDateKey,
  type Patient,
} from "./shared"

type Props = {
  date: string
  setDate: (value: string) => void
  slots: AppointmentSlot[]
  selectedSlot: string
  setSelectedSlot: (value: string) => void
  patient: Patient
  setPatient: (value: Patient) => void
  fieldErrors: Record<string, string>
  loading: boolean
  submitting: boolean
  error: string
  loadSlots: () => void | Promise<void>
  handleBooking: (event: SyntheticEvent<HTMLFormElement>) => void
}

export default function BookView({
  date,
  setDate,
  slots,
  selectedSlot,
  setSelectedSlot,
  patient,
  setPatient,
  fieldErrors,
  loading,
  submitting,
  error,
  loadSlots,
  handleBooking,
}: Props) {
  const groupedSlots = slots.reduce<
    { key: string; start: string; slots: AppointmentSlot[] }[]
  >((groups, slot) => {
    const key = localDateKey(slot.start)
    const group = groups.find((item) => item.key === key)

    if (group) {
      group.slots.push(slot)
    } else {
      groups.push({ key, start: slot.start, slots: [slot] })
    }

    return groups
  }, [])

  const selected = slots.find((slot) => slot.id === selectedSlot)
  const summaryDate = selected?.start ?? (date ? `${date}T12:00:00` : null)

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:py-16">
      <SectionHeading
        eyebrow="Appointment scheduling"
        title="Book an appointment"
        description="Choose a suitable date and time, then provide your details to reserve your visit."
      />

      {error && <ErrorMessage error={error} retry={loadSlots} />}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiCalendarLine className="size-5 text-primary" />
                Choose a date
              </CardTitle>
              <CardDescription>
                Select the day you would like to visit.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  setSelectedSlot("")
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiTimeLine className="size-5 text-primary" />
                Available appointment slots
              </CardTitle>
              <CardDescription>
                {date
                  ? formatDate(`${date}T12:00:00`)
                  : "Showing all available slots, grouped by date."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <LoadingCards />
              ) : slots.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <RiCalendarLine className="mx-auto mb-3 size-8 text-muted-foreground" />
                  <p className="font-semibold">No available slots</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {date
                      ? "Try selecting another date."
                      : "There are no open appointment slots right now."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedSlots.map((group) => (
                    <div key={group.key} className="space-y-3">
                      {!date && (
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <RiCalendarLine className="size-4 text-primary" />
                          {formatDate(group.start)}
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.slots.map((slot) => (
                          <button
                            type="button"
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`rounded-xl border p-4 text-left transition ${
                              selectedSlot === slot.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">
                                {formatTime(slot.start)}
                              </span>
                              {selectedSlot === slot.id ? (
                                <RiCheckLine className="size-5 text-primary" />
                              ) : (
                                <RiTimeLine className="size-5 text-muted-foreground" />
                              )}
                            </div>
                            {slot.end && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Until {formatTime(slot.end)}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient information</CardTitle>
              <CardDescription>
                Enter the details required to make your booking.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleBooking} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Full name</Label>
                  <Input
                    id="patientName"
                    placeholder="Your full name"
                    value={patient.patientName}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        patientName: e.target.value,
                      })
                    }
                  />
                  {fieldErrors.patientName && (
                    <p className="text-sm text-destructive">
                      {fieldErrors.patientName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={patient.email}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        email: e.target.value,
                      })
                    }
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-destructive">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || loading || !selectedSlot}
                >
                  {submitting ? (
                    <>
                      <RiLoader4Line className="mr-2 size-4 animate-spin" />
                      Booking appointment...
                    </>
                  ) : (
                    <>
                      Confirm appointment
                      <RiArrowRightLine className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Booking summary</CardTitle>
              <CardDescription>
                Review your appointment before submitting.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <RiCalendarLine size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-semibold">
                    {summaryDate ? formatDate(summaryDate) : "Not selected"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <RiTimeLine size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-semibold">
                    {selected ? formatTime(selected.start) : "No time selected"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2 rounded-lg bg-muted p-3">
                <RiShieldCheckLine className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your booking is confirmed only after the clinic API
                  successfully processes your request.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
