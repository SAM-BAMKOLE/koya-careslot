import express, { Router } from "express"
import { rateLimitMiddleware } from "@/middleware/rateLimit"
import {
  createBooking,
  getBookingById,
  cancelBookingById,
  listBookingsByEmail,
} from "@/modules/bookings/controller"

const router: express.Router = Router()

router.post("/", rateLimitMiddleware, createBooking)
router.get("/", listBookingsByEmail)
router.get("/:id", getBookingById)
router.delete("/:id", cancelBookingById)

export default router
