import { config } from "dotenv"
import { z } from "zod"

config()

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  API_KEY: z.string().min(1, "API_KEY is required"),
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error("Invalid environment variables:", _env.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = _env.data
