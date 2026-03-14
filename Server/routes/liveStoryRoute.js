const express = require("express");
const controller = require("../controllers/liveStoryController");
const authMiddleware = require("../middleware/authMiddleware");

// Note: Ensure admin check middleware is created if it exists. 
// For now, these admin routes might be protected by basic auth depends on the setup.
// If you have a specific isAdmin middleware, use it here.

const router = express.Router();

// Admin Routes
router.post("/admin/models", authMiddleware, controller.adminUpsertStoryModel);
router.get("/admin/models", authMiddleware, controller.adminGetStoryModels);
router.post("/admin/sync", authMiddleware, controller.adminSyncModels);
router.delete("/admin/models/:slug", authMiddleware, controller.adminDeleteStoryModel);

// User Chat Routes
router.get("/:storySlug/chat", authMiddleware, controller.getUserChat);
router.post("/:storySlug/chat/send", authMiddleware, controller.sendChatMessage);
router.delete("/:storySlug/chat/message/:messageId", authMiddleware, controller.deleteMessage);

module.exports = router;
