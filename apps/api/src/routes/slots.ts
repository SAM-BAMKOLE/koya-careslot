import express, { Router } from "express"
import { listSlots } from "@/modules/slots/controller"

const router: express.Router = Router()

router.get("/", listSlots)

export default router
