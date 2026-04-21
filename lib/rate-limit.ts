import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create rate limiters for different endpoints
const strictLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
});

const apiLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "60 s"), // 60 requests per minute
  analytics: true,
});

const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 login attempts per minute
  analytics: true,
});

const webhookLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "60 s"), // Webhooks can be more frequent
  analytics: true,
});

export async function rateLimit(
  identifier: string, 
  type: 'strict' | 'api' | 'auth' | 'webhook' = 'api'
) {
  try {
    let limiter;
    switch (type) {
      case 'strict':
        limiter = strictLimiter;
        break;
      case 'auth':
        limiter = authLimiter;
        break;
      case 'webhook':
        limiter = webhookLimiter;
        break;
      default:
        limiter = apiLimiter;
    }
    
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    
    return {
      success,
      limit,
      remaining,
      reset: reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open in development, fail closed in production
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        limit: 100,
        remaining: 99,
        reset: Date.now() + 60000,
      };
    }
    throw error;
  }
}