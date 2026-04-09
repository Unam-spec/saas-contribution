/**
 * lib/redis.ts
 *
 * Upstash Redis — used for:
 *  1. Caching dashboard aggregations (expensive SQL GROUP BY queries)
 *  2. Rate-limiting the transaction write endpoints
 *
 * Cache TTL strategy:
 *  - Dashboard stats: 5 minutes (300s). Stale by at most one page refresh.
 *  - Invalidated immediately on any transaction write/update/delete.
 */
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Singleton Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter: max 20 transaction writes per user per minute
export const transactionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit:transactions",
});

/** Cache key helpers — always prefix with user_id to isolate data */
export const cacheKeys = {
  dashboardStats: (userId: string) => `dashboard:${userId}:stats`,
};

const DASHBOARD_TTL = 300; // 5 minutes in seconds

export async function getCachedDashboardStats(userId: string) {
  const key = cacheKeys.dashboardStats(userId);
  const cached = await redis.get<string>(key);
  if (!cached) return null;
  try {
    return typeof cached === "string" ? JSON.parse(cached) : cached;
  } catch {
    return null;
  }
}

export async function setCachedDashboardStats(userId: string, data: unknown) {
  const key = cacheKeys.dashboardStats(userId);
  await redis.set(key, JSON.stringify(data), { ex: DASHBOARD_TTL });
}

/** Call this whenever a transaction is created, updated, or deleted */
export async function invalidateDashboardCache(userId: string) {
  const key = cacheKeys.dashboardStats(userId);
  await redis.del(key);
}
