const express = require("express");
const controller = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/createaifriend", authMiddleware, controller.createAiFriend);
router.post("/:chatId/send", authMiddleware,controller.AiFriendResponse);
router.get("/detials/:chatId", authMiddleware,controller.AiFriendDetails);
router.get("/chats/by-ai/:aiFriendId", authMiddleware,controller.getChatByAiFriend);


// {
//   sender: "ai",
//   text: "Optional description text",
//   videoUrl: "https://example.com/video.mp4", // or imgUrl for images
//   visibility: "show" // or "premium_required" or any other value for locked content
//   time: "2023-12-01T10:30:00.000Z"
// }

module.exports = router;
