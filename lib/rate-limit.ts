import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasRedisConfig =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN) &&
  !process.env.UPSTASH_REDIS_REST_URL?.includes("your-redis") &&
  !process.env.UPSTASH_REDIS_REST_URL?.includes("example.com");

const redis = hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const dummyRatelimit = {
  limit: async () => ({ success: true, limit: 100, remaining: 99, reset: 0 }),
};

// 30 requests per minute for AI routes
export const aiRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "panna:ai",
    })
  : dummyRatelimit;

// 60 requests per minute for CRUD routes
export const crudRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "panna:crud",
    })
  : dummyRatelimit;

// 5 requests per minute for auth routes
export const authRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "panna:auth",
    })
  : dummyRatelimit;

