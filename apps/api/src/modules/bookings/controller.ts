import { Request, Response } from "express"
import { z } from "zod"
import {
  bookSlot,
  cancelBooking,
  getBooking,
  listBookings,
} from "./service"
import {
  NewBookingSchema,
  SlotsQuerySchema,
  LimitQuerySchema,
  CursorQuerySchema,
} from "@/utils/validation"

export async function createBooking(req: Request, res: Response) {
  const idempotencyKey = req.header("Idempotency-Key") || undefined

  const parsed = NewBookingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: "missing or invalid fields" })
  }

  try {
    const result = await bookSlot(parsed.data, idempotencyKey)
    return res.status(result.status).json(result.body)
  } catch (err: any) {
    switch (err?.code) {
      case "SLOT_NOT_FOUND":
        return res.status(404).json({ error: "slot not found" })
      case "SLOT_ALREADY_STARTED":
        return res.status(400).json({ error: "slot has already started" })
      case "SLOT_ALREADY_BOOKED":
        return res.status(409).json({ error: "slot already booked" })
      case "IDEMPOTENCY_CONFLICT":
        return res.status(422).json({ error: "idempotency key reused with different body" })
      default:
        throw err
    }
  }
}

export async function getBookingById(req: Request, res: Response) {
  const booking = await getBooking(req.params.id)
  if (!booking) {
    return res.status(404).json({ error: "no booking with that id" })
  }
  res.status(200).json(booking)
}

export async function cancelBookingById(req: Request, res: Response) {
  const result = await cancelBooking(req.params.id)
  return res.status(result.status).json(result.body)
}

export async function listBookingsByEmail(req: Request, res: Response) {
  const email = req.query.email as string | undefined
  if (!email) {
    return res.status(400).json({ error: "email is required" })
  }

  const limitParsed = LimitQuerySchema.safeParse({ limit: req.query.limit })
  if (!limitParsed.success) {
    return res.status(400).json({ error: "invalid limit" })
  }
  const limit = limitParsed.data.limit

  const cursorParsed = CursorQuerySchema.safeParse({ cursor: req.query.cursor })
  if (!cursorParsed.success) {
    return res.status(400).json({ error: "invalid cursor" })
  }

  const result = await listBookings({
    email,
    limit,
    cursor: cursorParsed.data.cursor,
  })
  res.status(200).json(result)
}
