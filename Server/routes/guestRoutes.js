const express = require("express");
const controller = require("../controllers/guestController");

const router = express.Router();

router.get("/details/:aiFriendId", controller.GuestAiFriendDetails);
router.get("/chats/:aiFriendId", controller.GuestChatHistory);
router.post("/:aiFriendId/send", controller.GuestSendResponse);
router.post("/bots-message", controller.GuestBotAutoMessage);
router.get("/chat-friends", controller.GuestChatFriends);
router.delete("/:chatId/message/:messageId", controller.GuestDeleteMessage);

module.exports = router;
