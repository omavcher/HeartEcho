const express = require("express");
const controller = require("../controllers/authController");

const router = express.Router();

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.post('/google-login', controller.googleLogin);
router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);

router.post('/put-alldata', controller.PutAIFrindData);



module.exports = router;
