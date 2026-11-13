import { RiCheckLine, RiCloseCircleLine } from "@remixicon/react"

import type { Booking } from "@/lib/clinic-api"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { StatusBadge, formatDate, formatTime } from "./shared"

type Props = {
  booking: Booking | null
  loading: boolean
  error: string
  submitting: boolean
  handleCancel: () => void | Promise<void>
}

export default function BookingView({
  booking,
  loading,
  error,
  submitting,
  handleCancel,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      {loading ? (
        <Card>
          <CardContent className="space-y-4 p-8">
            <Skeleton className="mx-auto size-16 rounded-full" />
            <Skeleton className="mx-auto h-7 w-52" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RiCloseCircleLine className="mx-auto mb-4 size-12 text-destructive" />
            <h1 className="text-2xl font-bold">Booking unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button
              className="mt-6"
              nativeButton={false}
              render={<a href="/lookup" />}
            >
              Try another booking
            </Button>
          </CardContent>
        </Card>
      ) : booking ? (
        <Card>
          <CardContent className="p-6 sm:p-9">
            <div className="text-center">
              <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                {booking.status.toUpperCase() === "CANCELLED" ? (
                  <RiCloseCircleLine size={32} />
                ) : (
                  <RiCheckLine size={32} />
                )}
              </div>

              <Badge className="mb-3">
                {booking.status.toUpperCase() === "CANCELLED"
                  ? "Cancelled"
                  : "Booking confirmed"}
              </Badge>

              <h1 className="text-2xl font-bold">
                {booking.status.toUpperCase() === "CANCELLED"
                  ? "Appointment cancelled"
                  : "Your appointment is confirmed"}
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Keep your booking reference for future enquiries.
              </p>
            </div>

            <Separator className="my-7" />

            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted-foreground">
                  Booking reference
                </p>
                <p className="mt-1 font-semibold break-all">{booking.id}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Patient name</p>
                <p className="mt-1 font-semibold">{booking.name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Email address</p>
                <p className="mt-1 font-semibold">{booking.email}</p>
              </div>

              {booking.start && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Appointment date
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatDate(booking.start)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(booking.start)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="mt-2">
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            </div>

            {booking.status.toUpperCase() !== "CANCELLED" && (
              <>
                <Separator className="my-7" />

                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={submitting}
                  onClick={handleCancel}
                >
                  {submitting ? "Cancelling..." : "Cancel appointment"}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              className="mt-3 w-full"
              nativeButton={false}
              render={<a href="/" />}
            >
              Return home
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
