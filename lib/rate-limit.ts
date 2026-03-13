/**
 * In-memory rate limiter for API routes
 * Uses sliding window by IP. For production at scale, use Redis-backed (e.g. @upstash/ratelimit)
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/upload": { max: 20, windowMs: 60 * 1000 },        // 20 req/min
  "/api/chat-sessions": { max: 60, windowMs: 60 * 1000 }, // 60 req/min
  "/api/vector": { max: 30, windowMs: 60 * 1000 },        // 30 req/min
  "/api/create-payment-link": { max: 10, windowMs: 60 * 1000 },
  "/api/usage": { max: 60, windowMs: 60 * 1000 },
  "/api/visualize": { max: 20, windowMs: 60 * 1000 },
  default: { max: 60, windowMs: 60 * 1000 },
};

function getLimitForPath(pathname: string): { max: number; windowMs: number } {
  for (const [path, limit] of Object.entries(LIMITS)) {
    if (path !== "default" && pathname.startsWith(path)) return limit;
  }
  return LIMITS.default;
}

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown";
}

export function checkRateLimit(
  pathname: string,
  req: Request
): { success: boolean; remaining: number; resetIn: number } {
  const limit = getLimitForPath(pathname);
  const id = getClientIdentifier(req);
  const key = `${id}:${pathname}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + limit.windowMs };
    store.set(key, entry);
    return { success: true, remaining: limit.max - 1, resetIn: limit.windowMs };
  }

  entry.count++;
  if (entry.count > limit.max) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.max(0, entry.resetAt - now),
    };
  }

  return {
    success: true,
    remaining: limit.max - entry.count,
    resetIn: Math.max(0, entry.resetAt - now),
  };
}

// Cleanup expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60 * 1000);
}
