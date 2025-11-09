const express = require("express");
const controller = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const { verifyReferralCreator } = require("../utils/jwt");

const router = express.Router();

router.post("/dashboard-data", authMiddleware, controller.dashboardData);

router.get('/users-breakdown',authMiddleware, controller.getUsersBreakdown);

router.get('/users-administr',authMiddleware, controller.getUserDataAdmin);
router.get('/user-dataw' ,authMiddleware,  controller.UserALLDtaa);


router.get('/aiuser-data' ,  controller.aiAllModelData);
router.post('/put-alldata/multipel', controller.PutAIFrindData);




router.delete("/aiuser-data/:id", controller.deleteAIFriend);
router.put("/aiuser-data/:id", controller.updateAIFriend);
router.post("/aiuser-data/multiple", controller.PutAIFrindData);



router.get("/tickets", controller.getAllTickets);
router.delete("/tickets/:id", controller.deleteTicket);
router.put("/tickets/:id", controller.updateTicket);



// ========== REFERRAL ROUTES ==========
// Get all referral creators
router.get("/referral-creators", authMiddleware, controller.getReferralCreators);

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



module.exports = router;


