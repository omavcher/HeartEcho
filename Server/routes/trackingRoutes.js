const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
// If you want analytics protected, you can import authMiddleware. Assuming admin only needs it, but there's no specific admin check.
// Using standard authMiddleware for now, same as other admin routes.
const authMiddleware = require('../middleware/authMiddleware');

// Public route to accept events from any user (logged in or not)
router.post('/record', trackingController.recordEvent);

// Protected route to view analytics
router.get('/analytics', authMiddleware, trackingController.getAnalytics);

module.exports = router;
