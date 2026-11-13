import type { SyntheticEvent } from "react"

import {
  RiArrowRightLine,
  RiCalendarLine,
  RiFileList3Line,
  RiLoader4Line,
  RiMailLine,
  RiSearchLine,
  RiTimeLine,
} from "@remixicon/react"

import type { Booking } from "@/lib/clinic-api"

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
import { Skeleton } from "@/components/ui/skeleton"

import {
  ErrorMessage,
  SectionHeading,
  StatusBadge,
  formatDate,
  formatTime,
} from "./shared"

type Props = {
  appointments: Booking[]
  email: string
  setEmail: (value: string) => void
  loading: boolean
  error: string
  searched: boolean
  hasMore: boolean
  onSearch: (event: SyntheticEvent<HTMLFormElement>) => void
  onLoadMore: () => void
}

export default function AppointmentsView({
  appointments,
  email,
  setEmail,
  loading,
  error,
  searched,
  hasMore,
  onSearch,
  onLoadMore,
}: Props) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <SectionHeading
        eyebrow="Appointment management"
        title="My appointments"
        description="Enter the email address you used when booking to review your appointments."
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={onSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentsEmail">Email address</Label>
              <Input
                id="appointmentsEmail"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading && appointments.length === 0 ? (
                <>
                  <RiLoader4Line className="mr-2 size-4 animate-spin" />
                  Looking up appointments...
                </>
              ) : (
                <>
                  <RiSearchLine className="mr-2 size-4" />
                  Find my appointments
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <ErrorMessage error={error} />}

      {loading && appointments.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !searched ? (
        <Card>
          <CardContent className="p-10 text-center">
            <RiMailLine className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Find your appointments</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We use the email address on your booking to retrieve your
              appointment history.
            </p>
          </CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <RiFileList3Line className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No appointments found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No bookings are linked to this email address.
            </p>
            <Button
              className="mt-6"
              nativeButton={false}
              render={<a href="/book" />}
            >
              Book an appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <RiCalendarLine className="size-4 text-primary" />
                      {appointment.start
                        ? formatDate(appointment.start)
                        : "Appointment"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <RiTimeLine className="size-3.5" />
                      {appointment.start
                        ? formatTime(appointment.start)
                        : "Time to be confirmed"}
                    </CardDescription>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <Separator />

                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{appointment.name}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <RiMailLine className="size-4" />
                    {appointment.email}
                  </p>
                  <p className="text-xs break-all text-muted-foreground">
                    Reference: {appointment.id}
                  </p>
                  {appointment.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Booked on {formatDate(appointment.createdAt)}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a
                      href={`/booking/${encodeURIComponent(appointment.id)}`}
                    />
                  }
                >
                  View booking
                  <RiArrowRightLine className="ml-2 size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="pt-2 text-center">
              <Button variant="outline" disabled={loading} onClick={onLoadMore}>
                {loading ? (
                  <>
                    <RiLoader4Line className="mr-2 size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more appointments"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
