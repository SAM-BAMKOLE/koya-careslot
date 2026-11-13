import { resetSlots } from "@/modules/slots/service"
import { db } from "@/config/db"

const slots = [
  { id: "s1", provider: "Dr Ade", start: new Date("2026-12-10T09:00:00Z"), end: new Date("2026-12-10T09:30:00Z") },
  { id: "s2", provider: "Dr Ade", start: new Date("2026-12-10T10:00:00Z"), end: new Date("2026-12-10T10:30:00Z") },
  { id: "s3", provider: "Dr Ade", start: new Date("2026-12-10T11:00:00Z"), end: new Date("2026-12-10T11:30:00Z") },
  { id: "s4", provider: "Dr Ngozi", start: new Date("2026-12-10T09:00:00Z"), end: new Date("2026-12-10T09:30:00Z") },
  { id: "s5", provider: "Dr Ngozi", start: new Date("2026-12-10T10:00:00Z"), end: new Date("2026-12-10T10:30:00Z") },
]

async function main() {
  await resetSlots(slots)
  console.log(`Seeded ${slots.length} slots`)
  await db.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
