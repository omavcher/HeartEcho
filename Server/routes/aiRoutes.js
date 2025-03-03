const express = require("express");
const controller = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/createaifriend", authMiddleware, controller.createAiFriend);
router.post("/:chatId/send", authMiddleware,controller.AiFriendResponse);
router.get("/detials/:chatId", authMiddleware,controller.AiFriendDetails);


module.exports = router;
