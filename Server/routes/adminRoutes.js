const express = require("express");
const controller = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/dashboard-data", authMiddleware, controller.dashboardData);


module.exports = router;

