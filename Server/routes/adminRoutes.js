const express = require("express");
const controller = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { verifyReferralCreator } = require("../utils/jwt");
const referralController = require("../controllers/referralController");

const router = express.Router();

router.post("/dashboard-data", authMiddleware, controller.dashboardData);

router.get('/users-breakdown',authMiddleware, controller.getUsersBreakdown);
router.get('/deleted-accounts', authMiddleware, controller.getDeletedAccounts);
router.get('/today-indicators', authMiddleware, controller.getTodayIndicators);
router.get("/signup-conversion-stats", authMiddleware, controller.getSignupConversionStats);

router.get('/users-administr',authMiddleware, controller.getUserDataAdmin);
router.get('/user-dataw' ,authMiddleware,  controller.UserALLDtaa);
router.post('/manual-subscribe/:id', authMiddleware, controller.manualSubscription);


router.get('/aiuser-data' ,  controller.aiAllModelData);
router.post('/put-alldata/multipel', controller.PutAIFrindData);


router.delete("/aiuser-data/:id", controller.deleteAIFriend);
router.put("/aiuser-data/:id", controller.updateAIFriend);
router.post("/aiuser-data", controller.createAIFriend);
router.post("/aiuser-data/multiple", controller.PutAIFrindData);
router.post("/delete-media", authMiddleware, controller.deleteMedia);



router.get("/tickets", controller.getAllTickets);
router.delete("/tickets/:id", controller.deleteTicket);
router.put("/tickets/:id", controller.updateTicket);
router.post("/tickets/ai-suggest", controller.getAiSuggestReply);
router.post("/tickets/:id/email-reply", controller.sendTicketEmailReply);

// Deleted Account Email Routes
router.post("/deleted-accounts/ai-suggest", controller.getAiDeletedAccountReply);
router.post("/deleted-accounts/send-email", controller.sendDeletedAccountEmail);
router.get("/deleted-accounts/:originalUserId/feedback", controller.getDeletedUserFeedback);


// ========== REFERRAL ROUTES ==========
// Get all referral creators
router.get("/referral-creators", authMiddleware, controller.getReferralCreators);

// Get users referred by a creator
router.get("/referral-creators/:id/users", authMiddleware, controller.getReferralCreatorUsers);

// Create new referral creator (with password)
router.post("/referral-creators", controller.createReferralCreator);

// Creator login
router.post("/referral-creators/login", controller.creatorLogin);

// Get creator dashboard (protected)
router.get("/referral-creators/dashboard", verifyReferralCreator, controller.getCreatorDashboard);

// Update referral creator
router.put("/referral-creators/:id", authMiddleware, controller.updateReferralCreator);

// Delete referral creator
router.delete("/referral-creators/:id", authMiddleware, controller.deleteReferralCreator);

// Get creator by referral ID (public)
router.get("/referral-creators/by-id/:referralId", controller.getCreatorByReferralId);

// Get referral statistics
router.get("/referral-stats", authMiddleware, controller.getReferralStats);

// Get detailed referral analytics
router.get("/referral-analytics", controller.getReferralAnalytics);

// Track referral signup
router.post("/referral-track", authMiddleware, controller.trackReferralSignup);

// Process payout for creator
router.post("/referral-payout", controller.processPayout);





router.get("/chats-data", authMiddleware, controller.getAllChatsDataToday);

router.get("/login-activity",authMiddleware, controller.getLoginAnalytics)
router.get("/payment-activity",authMiddleware, controller.getPaymentAnalytics)
router.post("/send-notification", authMiddleware, controller.sendCustomNotification);
router.get("/notification-history", authMiddleware, controller.getNotificationHistory);
router.get("/device-stats", authMiddleware, controller.getDeviceStats);

// Automated Notification Campaigns
router.get("/auto-campaigns", authMiddleware, controller.getAutoCampaigns);
router.put("/auto-campaigns/:id", authMiddleware, controller.updateAutoCampaign);
router.post("/auto-campaigns/trigger/:id", authMiddleware, controller.triggerAutoCampaign);
router.post("/auto-campaigns/generate-ai-test/:id", authMiddleware, controller.generateAiCampaignPreview);

// App Version Management
router.get("/app-version", authMiddleware, controller.getAppVersionAdmin);
router.post("/app-version", authMiddleware, controller.updateAppVersionAdmin);

// Feedback Management
router.get("/feedbacks", authMiddleware, controller.getAllFeedbacksAdmin);
router.put("/feedbacks/:id/toggle-live", authMiddleware, controller.toggleFeedbackLiveAdmin);
router.delete("/feedbacks/:id", authMiddleware, controller.deleteFeedbackAdmin);

// ========== USER OWN REFERRAL & PAYOUT ROUTES ==========
router.get("/referrals/withdrawals", authMiddleware, referralController.adminGetWithdrawals);
router.post("/referrals/withdrawals/:id", authMiddleware, referralController.adminProcessWithdrawal);
router.get("/referrals/analytics", authMiddleware, referralController.adminGetAnalytics);
router.get("/referrals", authMiddleware, referralController.adminGetReferrals);
router.post("/referrals", authMiddleware, referralController.adminCreateReferral);
router.put("/referrals/:id", authMiddleware, referralController.adminUpdateReferral);
router.delete("/referrals/:id", authMiddleware, referralController.adminDeleteReferral);

module.exports = router;



