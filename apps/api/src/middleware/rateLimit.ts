import { Request, Response, NextFunction } from "express"
import { db } from "@/config/db"

const WINDOW_MS = 60 * 1000
const MAX_ATTEMPTS = 5

export function extractEmail(req: Request): string | null {
  const body = req.body as { email?: unknown } | undefined
  const email = body?.email
  if (typeof email === "string") {
    const trimmed = email.trim().toLowerCase()
    return trimmed || null
  }
  return null
}

export async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const email = extractEmail(req)
  if (!email) {
    return next()
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_MS)

  const attempts = await db.attemptRecord.findMany({
    where: {
      email,
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "asc" },
    take: MAX_ATTEMPTS + 1,
  })

  if (attempts.length >= MAX_ATTEMPTS) {
    const oldest = attempts[0].createdAt
    const retryAfter = Math.ceil((oldest.getTime() + WINDOW_MS - now.getTime()) / 1000)
    await db.attemptRecord.create({ data: { email } })
    return res.status(429).set("Retry-After", String(Math.max(1, retryAfter))).json({ error: "too many attempts for this email" })
  }

  await db.attemptRecord.create({ data: { email } })
  next()
}
