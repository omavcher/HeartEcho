const express = require("express");
const router = express.Router();
const paypalController = require("../controllers/paypalController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create-order", authMiddleware, paypalController.createOrder);
router.post("/capture-order", authMiddleware, paypalController.captureOrder);

module.exports = router;
