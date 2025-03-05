const express = require("express");
const controller = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/dashboard-data", authMiddleware, controller.dashboardData);

router.get('/users-breakdown',authMiddleware, controller.getUsersBreakdown);

router.get('/users-administr',authMiddleware, controller.getUserDataAdmin);
router.get('/user-dataw' ,authMiddleware,  controller.UserALLDtaa);


router.get('/aiuser-data' ,  controller.aiAllModelData);
router.post('/put-alldata/multipel', controller.PutAIFrindData);




router.delete("/aiuser-data/:id", controller.deleteAIFriend);
router.put("/aiuser-data/:id", controller.updateAIFriend);
router.post("/aiuser-data/multiple", controller.PutAIFrindData);



router.get("/tickets", controller.getAllTickets);
router.delete("/tickets/:id", controller.deleteTicket);
router.put("/tickets/:id", controller.updateTicket);

module.exports = router;


