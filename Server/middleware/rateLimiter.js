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

module.exports = {
  tierBasedRateLimiter
};
