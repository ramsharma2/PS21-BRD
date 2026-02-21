import rateLimit from 'express-rate-limit';
import Redis from 'ioredis';

// Initialize Redis client for rate limiting
let redis: Redis | null = null;

// Only initialize Redis if explicitly configured
if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '') {
    try {
        redis = new Redis(process.env.REDIS_URL);
        redis.on('error', (err) => {
            console.warn('Redis connection error for rate limiting:', err.message);
        });
        console.log('✓ Redis connected for rate limiting');
    } catch (error) {
        console.warn('Failed to initialize Redis for rate limiting, using memory store');
    }
} else {
    console.log('⚠ Redis disabled - using in-memory rate limiting');
}

/**
 * Rate limiter middleware
 * Limits requests to prevent abuse
 * RELAXED FOR TESTING
 */
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Effectively unlimited for testing
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => true, // Skip rate limiting entirely
});

/**
 * Stricter rate limiter for AI-intensive endpoints
 * DISABLED FOR TESTING
 */
export const aiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10000, // Effectively unlimited for testing
    message: {
        success: false,
        error: 'AI operation limit reached. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => true, // Skip rate limiting entirely
});
