const rateLimit = require('express-rate-limit');

// Check if rate limiting should be disabled (development mode)
const isRateLimitDisabled = process.env.DISABLE_RATE_LIMIT === 'true' || process.env.NODE_ENV === 'development';

// Log rate limit status on startup
if (isRateLimitDisabled) {
  console.log('⚠️  WARNING: Rate limiting is DISABLED (development mode)');
  console.log('   To enable, set DISABLE_RATE_LIMIT=false in .env or set NODE_ENV=production');
} else {
  console.log('✅ Rate limiting is ENABLED');
}

/**
 * General API rate limiter
 * Limits all API requests to prevent abuse
 */

const apiLimiter = rateLimit({
  skip: () => isRateLimitDisabled,
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: {
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Strict login rate limiter
 * Prevents brute force attacks on login endpoint
 */
const loginLimiter = rateLimit({
  skip: () => isRateLimitDisabled,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5, // 5 login attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * File upload rate limiter
 * Limits file upload requests to prevent abuse
 */
const fileUploadLimiter = rateLimit({
  skip: () => isRateLimitDisabled,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 file uploads per hour
  message: 'Too many file uploads from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limiter
 * Prevents password reset abuse
 */
const passwordResetLimiter = rateLimit({
  skip: () => isRateLimitDisabled,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: {
    message: 'Too many password reset requests, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  loginLimiter,
  fileUploadLimiter,
  passwordResetLimiter
};