import { Request, Response } from "express";
import { getSlots, resetSlots } from "./service";

export async function listSlots(req: Request, res: Response) {
  const provider = req.query.provider as string | undefined;
  const slots = await getSlots(provider);
  res.status(200).json({ slots });
}

type ResetSlotPayload = {
  id: string;
  provider: string;
  start: string;
  end: string;
  available?: boolean;
};

export async function resetAllSlots(req: Request, res: Response) {
  const { slots } = (req.body ?? {}) as { slots?: ResetSlotPayload[] };

  if (!Array.isArray(slots)) {
    return res.status(400).json({ error: "slots array is required" });
  }

  const parsed = slots.map((slot) => ({
    id: String(slot.id ?? "").trim(),
    provider: String(slot.provider ?? "").trim(),
    start: new Date(slot.start),
    end: new Date(slot.end),
    available: slot.available !== false,
  }));

  const invalid = parsed.some(
    (slot) =>
      !slot.id ||
      !slot.provider ||
      Number.isNaN(slot.start.getTime()) ||
      Number.isNaN(slot.end.getTime()) ||
      slot.end <= slot.start,
  );

  if (invalid) {
    return res.status(400).json({ error: "invalid slot data" });
  }

  await resetSlots(parsed);
  res.status(200).end();
}
