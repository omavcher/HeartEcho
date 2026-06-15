const express = require("express");
const controller = require("../controllers/authController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { otpIpLimiter, otpEmailLimiter } = require("../middleware/rateLimiter");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post('/google-login', controller.googleLogin);
router.post('/send-otp', otpIpLimiter, otpEmailLimiter, controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/forgot-password/send-otp', otpIpLimiter, otpEmailLimiter, controller.sendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', controller.verifyForgotPasswordOtp);
router.post('/forgot-password/reset', controller.resetPassword);
router.post("/update-fcm-token", authMiddleware, controller.updateFcmToken);

module.exports = router;
