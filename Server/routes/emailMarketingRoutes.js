const express = require("express");
const controller = require("../controllers/emailMarketingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC TRACKING ROUTES
// ==========================================
router.get("/track/open/:trackingId", controller.emailOpen);
router.get("/track/click/:trackingId", controller.emailClick);

// ==========================================
// PROTECTED ADMIN ROUTES (authMiddleware required)
// ==========================================

// Dashboard & Analytics
router.get("/dashboard", authMiddleware, controller.getMarketingStats);
router.get("/search-users", authMiddleware, controller.searchUsers);
router.get("/test-render-smtp", controller.testRenderSmtp);

// SMTP Credentials Routing
router.get("/smtp", authMiddleware, controller.getSmtpCredentials);
router.post("/smtp", authMiddleware, controller.createSmtpCredential);
router.put("/smtp/:id", authMiddleware, controller.updateSmtpCredential);
router.delete("/smtp/:id", authMiddleware, controller.deleteSmtpCredential);
router.post("/smtp/:id/test", authMiddleware, controller.testSmtpCredential);

// Templates Routing
router.get("/templates", authMiddleware, controller.getTemplates);
router.post("/templates", authMiddleware, controller.createTemplate);
router.put("/templates/:id", authMiddleware, controller.updateTemplate);
router.delete("/templates/:id", authMiddleware, controller.deleteTemplate);

// Campaigns Routing
router.get("/campaigns", authMiddleware, controller.getCampaigns);
router.post("/campaigns", authMiddleware, controller.createCampaign);
router.get("/campaigns/:id", authMiddleware, controller.getCampaignDetails);
router.delete("/campaigns/:id", authMiddleware, controller.deleteCampaign);

// Follow-Up Sequences Routing
router.get("/follow-ups", authMiddleware, controller.getFollowUps);
router.post("/follow-ups", authMiddleware, controller.createFollowUp);
router.delete("/follow-ups/:id", authMiddleware, controller.deleteFollowUp);
router.patch("/follow-ups/:id/toggle", authMiddleware, controller.toggleFollowUp);

module.exports = router;
