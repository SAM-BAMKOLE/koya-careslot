import express, { Router } from "express"
import { resetAllSlots } from "@/modules/slots/controller"

const router: express.Router = Router()

router.post("/", resetAllSlots)

export default router
