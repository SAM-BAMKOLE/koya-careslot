import { app } from "./app"
import { env } from "./config/env"

const PORT = Number(env.PORT)

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CareSlot API listening on port ${PORT} (${env.NODE_ENV})`)
})
