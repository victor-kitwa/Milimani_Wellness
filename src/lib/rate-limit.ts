/**
 * A small in-memory, per-process rate limiter - a fixed-window counter
 * keyed by whatever the caller passes in (usually "route:ip").
 *
 * This is in-process state, not a shared store, so it only throttles
 * requests hitting this one server instance and resets if the process
 * restarts. That's a real limitation on a multi-instance deployment, but
 * it stops the common case (a script hammering the login or register
 * endpoint from one place) with zero new infrastructure - no Redis or
 * external service required. Worth swapping for a shared store (e.g.
 * Upstash's Redis-backed limiter) if this app ever runs on more than one
 * instance at a time.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so a long-running process doesn't accumulate one
// entry per distinct key (e.g. IP) forever.
const MAX_BUCKETS = 5000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > MAX_BUCKETS) {
      for (const [k, v] of buckets) {
        if (v.resetAt <= now) buckets.delete(k);
      }
    }
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { allowed: true };
}

/** Best-effort client IP from the headers a proxy/load balancer sets. */
export function requestIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
