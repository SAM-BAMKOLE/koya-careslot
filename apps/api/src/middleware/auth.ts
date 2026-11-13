import { Request, Response, NextFunction } from "express";

export function apiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const providedKey = req.header("X-API-Key");
  if (!providedKey || providedKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}
