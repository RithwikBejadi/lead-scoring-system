const router = require("express").Router();
const controller = require("./lead.controller");

router.post("/", controller.createNewLead);
router.get("/:id", controller.fetchLead);
router.get("/:id/history", controller.fetchLeadHistory);

module.exports = router;
