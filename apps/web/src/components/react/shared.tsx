import { RiAlertLine, RiRefreshLine } from "@remixicon/react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export type Patient = {
  patientName: string
  email: string
}

export const localDateKey = (value: string | Date) => {
  const date = typeof value === "string" ? new Date(value) : value

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

export const formatDate = (date: string) => {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return "—"

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed)
}

export const formatTime = (date: string) => {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return "—"

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed)
}

export function ErrorMessage({
  error,
  retry,
}: {
  error: string
  retry?: () => void | Promise<void>
}) {
  return (
    <Alert variant="destructive" className="my-5">
      <RiAlertLine size={18} />
      <AlertTitle>Something needs your attention</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>{error}</span>
        {retry && (
          <Button size="sm" variant="outline" onClick={retry}>
            <RiRefreshLine className="mr-2 size-4" />
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const cancelled = status.toUpperCase() === "CANCELLED"

  return (
    <Badge variant={cancelled ? "secondary" : "default"}>
      {status.toLowerCase().replaceAll("_", " ")}
    </Badge>
  )
}

export function LoadingCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-20 rounded-xl" />
      ))}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-semibold tracking-wider text-primary uppercase">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">{description}</p>
    </div>
  )
}
