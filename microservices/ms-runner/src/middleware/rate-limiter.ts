import { NextFunction, Request, Response } from "express";
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "../config/constants";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const getKey = (req: Request): string => {
  const userId = (req.body?.userId as string | undefined) || "anon";
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  return `${userId}:${ip}`;
};

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const key = getKey(req);
  const now = Date.now();
  const windowMs = RATE_LIMIT_WINDOW_MS;
  const max = RATE_LIMIT_MAX;

  const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  if (bucket.count >= max) {
    return res.status(429).json({
      message: "Rate limit exceeded",
      retry_in_ms: bucket.resetAt - now,
    });
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return next();
};
