const express = require("express");
const controller = require("../controllers/liveStoryController");
const authMiddleware = require("../middleware/authMiddleware");
const { generatePresignedPutUrl } = require("../utils/s3Upload");

const router = express.Router();

// ─── Presigned URL endpoint (for direct browser → R2 uploads) ────────────────
// Frontend calls this to get a short-lived signed URL, then PUTs the file directly.
router.post("/admin/presign", authMiddleware, async (req, res) => {
  try {
    const { folder, filename, contentType } = req.body;

    if (!folder || !filename || !contentType) {
      return res.status(400).json({
        success: false,
        message: "folder, filename, and contentType are required.",
      });
    }

    // Restrict to safe folders only
    const allowedFolders = [
      "live-stories/poster",
      "live-stories/banner",
      "live-stories/movie",
      "live-stories/chatting",
    ];
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ success: false, message: "Invalid folder." });
    }

    const result = await generatePresignedPutUrl(folder, filename, contentType);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────
// NOTE: No multer here anymore — frontend uploads directly to R2 and sends us the CDN URLs.
router.post("/admin/models", authMiddleware, controller.adminUpsertStoryModel);
router.get("/admin/models", authMiddleware, controller.adminGetStoryModels);
router.post("/admin/sync", authMiddleware, controller.adminSyncModels);
router.delete("/admin/models/:slug", authMiddleware, controller.adminDeleteStoryModel);

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get("/stories", controller.getPublicStories);
router.get("/stories/:slug", controller.getPublicStoryBySlug);

// ─── User Chat Routes ─────────────────────────────────────────────────────────
router.get("/:storySlug/chat", authMiddleware, controller.getUserChat);
router.post("/:storySlug/chat/send", authMiddleware, controller.sendChatMessage);
router.delete("/:storySlug/chat/message/:messageId", authMiddleware, controller.deleteMessage);

module.exports = router;
