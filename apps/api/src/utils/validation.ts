import { z } from "zod"

export const NewBookingSchema = z.object({
  slot_id: z.string().min(1, "slot_id is required"),
  name: z.string().min(1, "name is required"),
  email: z.string().email("email must be valid"),
})

export type NewBookingInput = z.infer<typeof NewBookingSchema>

export const SlotsQuerySchema = z.object({
  provider: z.string().optional(),
})

export const LimitQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .refine((val) => {
      if (val === undefined) return true
      const n = Number(val)
      return !Number.isNaN(n) && Number.isInteger(n) && n >= 1 && n <= 50
    }, "limit must be an integer between 1 and 50")
    .transform((val) => (val === undefined ? 10 : Number(val))),
})

export const CursorQuerySchema = z.object({
  cursor: z.string().optional(),
})

export function hashPayload(payload: unknown): string {
  const str = JSON.stringify(payload)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return String(hash)
}
