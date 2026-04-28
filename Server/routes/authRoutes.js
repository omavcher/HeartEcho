const express = require("express");
const controller = require("../controllers/authController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post('/google-login', controller.googleLogin);
router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post("/update-fcm-token", authMiddleware, controller.updateFcmToken);

module.exports = router;
