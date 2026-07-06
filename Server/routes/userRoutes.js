const express = require("express");
const controller = require("../controllers/userController");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const referralController = require("../controllers/referralController");

const router = express.Router();

router.post('/auto-notifications', authMiddleware, controller.autoNotificationsGen);


router.get("/get-user", authMiddleware, controller.getProfile);
router.post("/verify-user", authMiddleware, controller.verifyUser);
router.put("/update-profile", authMiddleware, controller.updateProfile );
router.post("/login-details", authMiddleware, controller.loginDetail );
router.get("/login-details", authMiddleware, controller.getLoginDetail );
router.get("/get-tickets", authMiddleware, controller.getTickets );
router.post("/make-ticket", authMiddleware, controller.makeTicket );
router.post("/support-chat", authMiddleware, require("../controllers/supportController").handleSupportChat);
router.post("/send-otp-destroy", authMiddleware, controller.sendOtpDestroy );
router.post("/verify-otp-destroy", authMiddleware, controller.verifyOtpDestroy );
router.delete("/delete-account", authMiddleware, controller.deleteAccount );
router.post("/twofactor", authMiddleware, controller.twoFactor );
router.get("/user-type", authMiddleware, controller.userType );
router.get("/chat-friends", authMiddleware, controller.chatFriends );
router.get("/chats/:chatId", authMiddleware, controller.chatsDatas );
router.post("/chats/:chatId/read", authMiddleware, controller.markChatAsRead );
router.get("/get-pre-ai", controller.getAllPreAIFriends );
router.post("/voice-waitlist", controller.joinVoiceWaitlist );
router.get("/get-chat-data", authMiddleware, controller.getChatData );

// Economy & Relationships System Routes
router.post("/daily-login", authMiddleware, controller.dailyLoginClaim);
router.get("/discover/cards", authMiddleware, controller.getDiscoverCards);
router.post("/discover/swipe", authMiddleware, controller.postSwipeAction);
router.post("/discover/reset", authMiddleware, controller.postResetSwipes);
router.get("/chats/:chatId/relationship", authMiddleware, controller.getChatRelationship);
router.post("/chats/:chatId/gifts", authMiddleware, controller.sendGift);
router.post("/chats/:chatId/dates", authMiddleware, controller.goOnDate);
router.put("/chats/:chatId/memory", authMiddleware, controller.updateMemory);
router.post("/chats/:chatId/personality", authMiddleware, controller.updatePersonality);
router.post("/chats/:chatId/clear", authMiddleware, controller.clearChat);
router.delete("/chats/:chatId/messages/:messageId", authMiddleware, controller.deleteMessage );
router.post('/payment/save', authMiddleware , controller.paymentSave);
router.post('/webhook/razorpay', express.raw({type: 'application/json'}), controller.razorpayWebhook);
router.get('/payment-details', authMiddleware , controller.getPaymentData);


router.get("/subscription/status", authMiddleware, controller.getSubscriptionStatus);
router.get("/plans", authMiddleware, controller.getSubscriptionPlans);
router.post("/update", authMiddleware, controller.updateSubscription);
router.post("/check-quota", authMiddleware, controller.checkMessageQuota);

// User-to-User Referral Routes
router.get("/referrals/dashboard", authMiddleware, referralController.getReferralDashboard);
router.post("/referrals/withdraw", authMiddleware, referralController.requestWithdrawal);
router.post("/referrals/convert", authMiddleware, referralController.convertRewardsToPremium);
router.get("/referrals/leaderboard", referralController.getMonthlyLeaderboard);



// Upgrade routes (prorated billing)
router.post("/payment/upgrade", authMiddleware, controller.upgradeSubscription);
router.get("/payment/upgrade-pricing", authMiddleware, controller.getUpgradePricing);

const adminController = require("../controllers/adminController");

// FCM Token (Push Notifications) - called by Flutter app on login/signup
router.post("/update-fcm-token", authMiddleware, authController.updateFcmToken);

// Track Notification Clicks (called by Flutter app when notification is opened)
router.post("/track-notification-click", authMiddleware, adminController.trackNotificationClick);

// Track Play Store Install Referrer (called by Flutter app on start/login/signup)
router.post("/install-referrer", controller.saveInstallReferrer);

// Get latest app version info (public)
router.get("/app-version", controller.getAppVersion);

// Feedback / Reviews routes
router.post("/submit-feedback", authMiddleware, controller.submitFeedback);
router.get("/feedbacks", controller.getFeedbacks);

module.exports = router;
