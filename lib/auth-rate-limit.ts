import "server-only";

import { createHash } from "node:crypto";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();
let operations = 0;

export function getClientAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address = forwardedFor?.split(",")[0]?.trim();
  return address || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function consumeRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  if (++operations % 100 === 0 || buckets.size > 10_000) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }

  const digest = createHash("sha256").update(identifier).digest("hex");
  const key = `${scope}:${digest}`;
  const current = buckets.get(key);

  if (!current && buckets.size >= 10_000) {
    return false;
  }

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}
