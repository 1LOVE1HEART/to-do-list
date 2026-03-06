import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;
let tryonRatelimit: Ratelimit | null = null;

function getRatelimit() {
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "triple-planck:register",
    });
  }
  return ratelimit;
}

function getTryonRatelimit() {
  if (!tryonRatelimit) {
    tryonRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "triple-planck:tryon",
    });
  }
  return tryonRatelimit;
}

export async function checkRateLimit(ip: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const limiter = getRatelimit();
  const { success, remaining, reset } = await limiter.limit(ip);
  return { success, remaining, reset };
}

export async function checkTryonRateLimit(userId: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const limiter = getTryonRatelimit();
  const { success, remaining, reset } = await limiter.limit(userId);
  return { success, remaining, reset };
}
