const express = require("express");
const controller = require("../controllers/guestController");
const { tierBasedRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/details/:aiFriendId", controller.GuestAiFriendDetails);
router.get("/chats/:aiFriendId", controller.GuestChatHistory);
router.post("/:aiFriendId/send", tierBasedRateLimiter, controller.GuestSendResponse);
router.get("/chat-friends", controller.GuestChatFriends);

module.exports = router;
