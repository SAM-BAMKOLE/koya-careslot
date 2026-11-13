import type { SyntheticEvent } from "react"

import { RiSearchLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { ErrorMessage, SectionHeading } from "./shared"

type Props = {
  lookupId: string
  setLookupId: (value: string) => void
  error: string
  handleLookup: (event: SyntheticEvent<HTMLFormElement>) => void
}

export default function LookupView({
  lookupId,
  setLookupId,
  error,
  handleLookup,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <SectionHeading
        eyebrow="Booking management"
        title="Find your appointment"
        description="Enter your booking reference to view your appointment details."
      />

      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleLookup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bookingId">Booking reference</Label>
              <Input
                id="bookingId"
                placeholder="Enter your booking ID"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
              />
            </div>

            {error && <ErrorMessage error={error} />}

            <Button className="w-full" type="submit">
              <RiSearchLine className="mr-2 size-4" />
              Find booking
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Can't find your reference? Check the confirmation details from your
        original booking.
      </p>
    </div>
  )
}
