import express from "express"
import helmet from "helmet"
import cors from "cors"
import { env } from "@/config/env"
import { db } from "@/config/db"
import { apiKeyMiddleware } from "@/middleware/auth"
import { errorMiddleware } from "@/middleware/error"
import slotsRouter from "@/routes/slots"
import bookingsRouter from "@/routes/bookings"
import resetRouter from "@/routes/reset"

const app: express.Application = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: "100kb" }))

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

app.use("/slots", slotsRouter)
app.use("/bookings", apiKeyMiddleware, bookingsRouter)
app.use("/reset", resetRouter)

app.use(errorMiddleware)

export { app }
export { db }
