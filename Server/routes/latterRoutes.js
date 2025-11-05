const express = require("express");
const controller = require("../controllers/latterController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send", authMiddleware, controller.generateLetterResponse);
router.get("/ai-friends/90s-era", controller.getPredefinedAIFriends);
router.get("/received", authMiddleware, controller.getAllLetters);

module.exports = router;
