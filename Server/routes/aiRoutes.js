const express = require("express");
const controller = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/createaifriend", authMiddleware, controller.createAiFriend);
router.post("/:chatId/send", authMiddleware,controller.AiFriendResponse);
router.get("/detials/:aiFriendId", authMiddleware,controller.AiFriendDetails);
router.get("/chats/by-ai/:aiFriendId", authMiddleware,controller.getChatByAiFriend);
router.get("/quota/status", authMiddleware, controller.getAiQuotaStatus);

module.exports = router;
