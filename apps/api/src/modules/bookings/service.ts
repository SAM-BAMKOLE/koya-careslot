import { Prisma, PrismaClient } from "@prisma/client"
import { db } from "@/config/db"
import { NewBookingInput, hashPayload } from "@/utils/validation"

export type BookingResult = {
  id: string
  slot_id: string
  name: string
  email: string
  status: string
  created_at: Date
}

export interface SlotAlreadyStartedError extends Error {
  code: "SLOT_ALREADY_STARTED"
}
export interface SlotNotFoundError extends Error {
  code: "SLOT_NOT_FOUND"
}
export interface SlotAlreadyBookedError extends Error {
  code: "SLOT_ALREADY_BOOKED"
}
export interface IdempotencyConflictError extends Error {
  code: "IDEMPOTENCY_CONFLICT"
}
export interface BookingNotFoundError extends Error {
  code: "BOOKING_NOT_FOUND"
}
export interface AlreadyCancelledError extends Error {
  code: "ALREADY_CANCELLED"
}

export async function bookSlot(
  input: NewBookingInput,
  idempotencyKey?: string,
): Promise<{ status: number; body: BookingResult | { error: string } }> {
  const normalizedName = input.name.trim()
  const normalizedEmail = input.email.trim().toLowerCase()

  const normalizedInput: NewBookingInput = {
    slot_id: input.slot_id,
    name: normalizedName,
    email: normalizedEmail,
  }

  const requestHash = hashPayload(normalizedInput)
  const now = new Date()

  // Check existing idempotency record outside transaction first (fast path)
  if (idempotencyKey) {
    const existing = await db.idempotencyRecord.findUnique({
      where: { idempotencyKey },
    })
    if (existing) {
      if (existing.requestHash === requestHash) {
        return { status: 201, body: existing.response as unknown as BookingResult }
      }
      return { status: 422, body: { error: "idempotency key reused with different body" } }
    }
  }

  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    // Re-check inside transaction for concurrent same-key requests
    if (idempotencyKey) {
      const existing = await tx.idempotencyRecord.findUnique({
        where: { idempotencyKey },
      })
      if (existing) {
        if (existing.requestHash === requestHash) {
          return {
            status: 201,
            body: existing.response as unknown as BookingResult,
          } as { status: number; body: BookingResult | { error: string } }
        }
        throw Object.assign(new Error("idempotency conflict"), { code: "IDEMPOTENCY_CONFLICT" })
      }
    }

    // Check slot exists
    const slot = await tx.slot.findUnique({ where: { id: input.slot_id } })
    if (!slot) {
      throw Object.assign(new Error("slot not found"), { code: "SLOT_NOT_FOUND" })
    }

    // Check slot has not already started
    if (slot.start <= now) {
      throw Object.assign(new Error("slot has already started"), { code: "SLOT_ALREADY_STARTED" })
    }

    // Atomically claim the slot only if still available
    const claimed = await tx.slot.updateMany({
      where: { id: input.slot_id, isBooked: false },
      data: { isBooked: true },
    })
    if (claimed.count === 0) {
      throw Object.assign(new Error("slot already booked"), { code: "SLOT_ALREADY_BOOKED" })
    }

    // Create the booking
    const booking = await tx.booking.create({
      data: {
        id: `b_${crypto.randomUUID()}`,
        slotId: input.slot_id,
        name: normalizedName,
        email: normalizedEmail,
        status: "confirmed",
      },
    })

    // Persist idempotency record atomically with the booking
    if (idempotencyKey) {
      const responseBody: BookingResult = {
        id: booking.id,
        slot_id: booking.slotId,
        name: booking.name,
        email: booking.email,
        status: booking.status,
        created_at: booking.createdAt,
      }
      await tx.idempotencyRecord.create({
        data: {
          idempotencyKey,
          requestHash,
          bookingId: booking.id,
          response: responseBody,
        },
      })
    }

    return {
      status: 201,
      body: {
        id: booking.id,
        slot_id: booking.slotId,
        name: booking.name,
        email: booking.email,
        status: booking.status,
        created_at: booking.createdAt,
      },
    }
  })

  return result as { status: number; body: BookingResult | { error: string } }
}

export async function getBooking(id: string): Promise<BookingResult | null> {
  const booking = await db.booking.findUnique({ where: { id } })
  if (!booking) return null
  return {
    id: booking.id,
    slot_id: booking.slotId,
    name: booking.name,
    email: booking.email,
    status: booking.status,
    created_at: booking.createdAt,
  }
}

export async function cancelBooking(id: string): Promise<{ status: number; body: BookingResult | { error: string } }> {
  return await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const booking = await tx.booking.findUnique({ where: { id } })
    if (!booking) {
      return { status: 404, body: { error: "no booking with that id" } }
    }
    if (booking.status === "cancelled") {
      return { status: 409, body: { error: "already cancelled" } }
    }

    const updated = await tx.booking.update({
      where: { id },
      data: { status: "cancelled" },
    })

    // Release the slot
    await tx.slot.update({
      where: { id: booking.slotId },
      data: { isBooked: false },
    })

    return {
      status: 200,
      body: {
        id: updated.id,
        slot_id: updated.slotId,
        name: updated.name,
        email: updated.email,
        status: updated.status,
        created_at: updated.createdAt,
      },
    }
  })
}

export async function listBookings({
  email,
  limit,
  cursor,
}: {
  email: string
  limit: number
  cursor?: string
}): Promise<{ bookings: BookingResult[]; next_cursor: string | null }> {
  const normalizedEmail = email.trim().toLowerCase()

  const bookings = await db.booking.findMany({
    where: { email: normalizedEmail },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasNextPage = bookings.length > limit
  const page = hasNextPage ? bookings.slice(0, -1) : bookings
    const next_cursor = hasNextPage ? (page[page.length - 1]?.id ?? null) : null

  return {
    bookings: page.map((b: typeof bookings[number]) => ({
      id: b.id,
      slot_id: b.slotId,
      name: b.name,
      email: b.email,
      status: b.status,
      created_at: b.createdAt,
    })),
    next_cursor,
  }
}
