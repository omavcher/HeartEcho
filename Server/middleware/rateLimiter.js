const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const User = require('../models/User'); 

// Custom rate limiter based on subscription tier
const tierBasedRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: async (req, res) => {
    // Default limit for guests or unauthenticated users
    let limit = 5; 
    
    if (req.user && req.user.id) {
      try {
        const user = await User.findById(req.user.id);
        if (user) {
          if (user.subscriptionTier === 'yearly_pro') {
            limit = 100; // Ultimate - essentially unlimited for normal human usage per minute
          } else if (user.subscriptionTier === 'yearly') {
            limit = 60; // Yearly premium - generous limit
          } else if (user.subscriptionTier === 'monthly') {
            limit = 30; // Monthly premium - good limit
          } else {
            limit = 10; // Free registered users
          }
        }
      } catch (error) {
        console.error("Rate limiter DB error:", error);
      }
    }
    return limit;
  },
  message: {
    success: false,
    message: "Rate limit exceeded. Please wait a moment before sending more messages.",
    rateLimitExceeded: true
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID for authenticated users, IPv6-safe IP for guests
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return req.user.id;
    }
    return ipKeyGenerator(req); // IPv6-safe helper
  }
});

// Rate limiter for OTP requests based on IP (3 requests per 10 minutes)
const otpIpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes window
  max: 3, // limit each IP to 3 requests per window
  message: {
    success: false,
    message: "Too many OTP requests from this IP address. Please try again after 10 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return ipKeyGenerator(req);
  }
});

// Rate limiter for OTP requests based on Email address (3 requests per 10 minutes)
const otpEmailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes window
  max: 3, // limit each email to 3 requests per window
  message: {
    success: false,
    message: "Too many OTP requests for this email address. Please try again after 10 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.body && req.body.email) {
      return req.body.email.toLowerCase().trim();
    }
    // Fallback to IP if no email is provided
    return ipKeyGenerator(req);
  }
});

module.exports = {
  tierBasedRateLimiter,
  otpIpLimiter,
  otpEmailLimiter
};
