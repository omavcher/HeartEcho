const express = require("express");
const controller = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/get-user", authMiddleware, controller.getProfile);
router.post("/verify-user", authMiddleware, controller.verifyUser);
router.put("/update-profile", authMiddleware, controller.updateProfile );
router.post("/login-details", authMiddleware, controller.loginDetail );
router.get("/login-details", authMiddleware, controller.getLoginDetail );
router.get("/get-tickets", authMiddleware, controller.getTickets );
router.post("/make-ticket", authMiddleware, controller.makeTicket );
router.post("/send-otp-destroy", authMiddleware, controller.sendOtpDestroy );
router.post("/verify-otp-destroy", authMiddleware, controller.verifyOtpDestroy );
router.delete("/delete-account", authMiddleware, controller.deleteAccount );
router.post("/twofactor", authMiddleware, controller.twoFactor );
router.get("/user-type", authMiddleware, controller.userType );
router.get("/chat-friends", authMiddleware, controller.chatFriends );
router.get("/chats/:chatId", authMiddleware, controller.chatsDatas );
router.get("/get-pre-ai", controller.getAllPreAIFriends );
router.get("/get-chat-data", authMiddleware, controller.getChatData );
router.delete("/chats/:chatId/messages/:messageId", authMiddleware, controller.deleteMessage );
router.post('/payment/save', authMiddleware , controller.paymentSave);
router.get('/payment-details', authMiddleware , controller.getPaymentData);

module.exports = router;
