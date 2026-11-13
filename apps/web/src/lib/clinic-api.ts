export type AppointmentSlot = {
  id: string
  provider: string
  start: string
  end: string
  available: boolean
}

export type Booking = {
  id: string
  slotId: string
  name: string
  email: string
  status: "confirmed" | "cancelled" | string
  createdAt?: string
  /** Enriched on the client from the slot list. */
  start?: string
  end?: string
}

export type BookingInput = {
  slot_id: string
  name: string
  email: string
}

export type BookingsPage = {
  items: Booking[]
  nextCursor: string | null
}

type RawSlot = {
  id: string
  provider: string
  start: string
  end: string
  available: boolean
}

type RawBooking = {
  id: string
  slot_id: string
  name: string
  email: string
  status: string
  created_at?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const API_ROUTES = {
  slots: "/slots",
  bookings: "/bookings",
  booking: (id: string) => `/bookings/${encodeURIComponent(id)}`,
}

function toBooking(raw: RawBooking): Booking {
  return {
    id: raw.id,
    slotId: raw.slot_id,
    name: raw.name,
    email: raw.email,
    status: raw.status,
    createdAt: raw.created_at,
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`/api/clinic${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError(
      "Unable to reach CareSlot. Check your connection and try again.",
      0
    )
  }

  const retryAfter = Number(response.headers.get("Retry-After")) || undefined

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || "Something went wrong.",
      response.status,
      retryAfter,
      data
    )
  }

  return data as T
}

export const clinicApi = {
  async getSlots(provider?: string): Promise<AppointmentSlot[]> {
    const query = provider
      ? `?provider=${encodeURIComponent(provider)}`
      : ""

    const data = await request<{ slots?: RawSlot[] }>(
      `${API_ROUTES.slots}${query}`
    )

    return data.slots ?? []
  },

  async createBooking(
    payload: BookingInput,
    idempotencyKey: string
  ): Promise<Booking> {
    const data = await request<RawBooking>(API_ROUTES.bookings, {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    })

    return toBooking(data)
  },

  async getBooking(id: string): Promise<Booking> {
    const data = await request<RawBooking>(API_ROUTES.booking(id))

    return toBooking(data)
  },

  async getBookings(
    email: string,
    limit = 10,
    cursor?: string
  ): Promise<BookingsPage> {
    const params = new URLSearchParams({
      email,
      limit: String(limit),
    })

    if (cursor) params.set("cursor", cursor)

    const data = await request<{
      bookings?: RawBooking[]
      next_cursor?: string | null
    }>(`${API_ROUTES.bookings}?${params.toString()}`)

    return {
      items: (data.bookings ?? []).map(toBooking),
      nextCursor: data.next_cursor ?? null,
    }
  },

  async cancelBooking(id: string): Promise<Booking> {
    const data = await request<RawBooking>(API_ROUTES.booking(id), {
      method: "DELETE",
    })

    return toBooking(data)
  },
}
