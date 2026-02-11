const express = require("express");
const controller = require("../controllers/statusController");
const router = express.Router();


router.get("/get-story", controller.GetStatus);


module.exports = router;
