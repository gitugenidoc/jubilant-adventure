import rateLimit from "express-rate-limit";

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: "Too many requests, please try again later",
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health";
  },
});

// Stricter limiter for authentication
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || 5),
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },
});

// Very strict limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many password reset attempts, please try again later",
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },
});

// Limiter for MFA
export const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many MFA attempts, please try again later",
  keyGenerator: (req) => {
    return req.body.userId || req.ip;
  },
});

// Per-user rate limiter for sensitive operations
export const perUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: "User rate limit exceeded",
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});
