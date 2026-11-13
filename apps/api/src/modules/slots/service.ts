import { Prisma } from "@prisma/client";
import { db } from "@/config/db";
import { SlotsQuerySchema } from "@/utils/validation";

export type SlotWithAvailability = {
  id: string;
  provider: string;
  start: Date;
  end: Date;
  available: boolean;
};

export async function getSlots(
  provider?: string,
): Promise<SlotWithAvailability[]> {
  const parsed = SlotsQuerySchema.safeParse({ provider });
  if (!parsed.success) {
    throw new Error("invalid provider query");
  }

  const slots = await db.slot.findMany({
    where: parsed.data.provider ? { provider: parsed.data.provider } : {},
    orderBy: { start: "asc" },
  });

  return slots.map((s: (typeof slots)[number]) => ({
    id: s.id,
    provider: s.provider,
    start: s.start,
    end: s.end,
    available: !s.isBooked,
  }));
}

export async function resetSlots(
  slots: Array<{
    id: string;
    provider: string;
    start: Date;
    end: Date;
    available?: boolean;
  }>,
) {
  return await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.booking.deleteMany({});
    await tx.slot.deleteMany({});
    await tx.slot.createMany({
      data: slots.map((s) => ({
        id: s.id,
        provider: s.provider,
        start: s.start,
        end: s.end,
        isBooked: s.available === false,
      })),
    });
  });
}

export async function findSlotById(id: string) {
  return await db.slot.findUnique({ where: { id } });
}
